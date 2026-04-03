from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Avg, Count, Max, Min, Q
from .models import Exam, ExamEnrollment, Course, CourseEnrollment
from .serializers import (
    ExamSerializer, ExamListSerializer, ExamEnrollmentSerializer,
    CourseSerializer, CourseEnrollmentSerializer
)
from exam_proctor_backend.apps.proctoring.models import ExamSession, ProctoringViolation
from exam_proctor_backend.apps.proctoring.serializers import ExamSessionSerializer, ProctoringViolationSerializer
from exam_proctor_backend.apps.submissions.models import QuestionSubmission, MCQSubmission, CodingSubmission
from exam_proctor_backend.apps.questions.models import Question, MCQQuestion, MCQOption, CodingQuestion, TestCase
from django.db import transaction
from datetime import timedelta


class CourseViewSet(viewsets.ModelViewSet):
    """CRUD for courses. Instructors manage, students browse."""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'instructor' or user.role == 'admin':
            return Course.objects.filter(instructor=user)
        return Course.objects.filter(is_published=True)

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def enroll(self, request, pk=None):
        """Enroll current student in a course."""
        course = self.get_object()
        enrollment, created = CourseEnrollment.objects.get_or_create(
            student=request.user, course=course
        )
        serializer = CourseEnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_courses(self, request):
        """Get courses the current user is enrolled in (with progress)."""
        enrollments = CourseEnrollment.objects.filter(
            student=request.user
        ).select_related('course', 'course__instructor')
        serializer = CourseEnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)


class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return ExamListSerializer
        return ExamSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role == 'instructor' or user.role == 'admin':
            queryset = Exam.objects.filter(instructor=user)
        else:
            status_param = self.request.query_params.get('status')
            if status_param:
                queryset = Exam.objects.filter(status=status_param)
            else:
                queryset = Exam.objects.filter(status__in=['published', 'active'])

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def enroll(self, request, pk=None):
        """Enroll student in exam."""
        exam = self.get_object()
        try:
            existing = ExamEnrollment.objects.get(exam=exam, student=request.user)
            if existing.status in ['submitted', 'completed']:
                return Response(
                    {'error': 'You have already completed this exam.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            serializer = ExamEnrollmentSerializer(existing)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ExamEnrollment.DoesNotExist:
            enrollment = ExamEnrollment.objects.create(exam=exam, student=request.user)
            serializer = ExamEnrollmentSerializer(enrollment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def start(self, request, pk=None):
        """Start exam."""
        exam = self.get_object()
        try:
            enrollment = ExamEnrollment.objects.get(exam=exam, student=request.user)
            if enrollment.status in ['submitted', 'completed']:
                return Response(
                    {'error': 'You have already submitted this exam.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            enrollment.status = 'started'
            enrollment.started_at = timezone.now()
            enrollment.save()
            return Response({'message': 'Exam started', 'enrollment': ExamEnrollmentSerializer(enrollment).data})
        except ExamEnrollment.DoesNotExist:
            return Response({'error': 'Not enrolled in this exam'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def submit(self, request, pk=None):
        """Finalize and submit exam with all answers and auto-grading."""
        exam = self.get_object()
        user = request.user
        data = request.data
        
        answers = data.get('answers', {})
        time_taken_seconds = data.get('time_taken_seconds', 0)
        
        try:
            with transaction.atomic():
                enrollment = ExamEnrollment.objects.select_for_update().get(exam=exam, student=user)
                
                if enrollment.status in ['completed', 'submitted'] and not exam.allow_multiple_attempts:
                    return Response({'error': 'Exam already completed'}, status=status.HTTP_400_BAD_REQUEST)
                
                # 1. Process all answers and calculate score
                total_earned_marks = 0
                correct_count = 0
                questions = Question.objects.filter(exam=exam)
                
                for question in questions:
                    user_answer = answers.get(str(question.id))
                    
                    # Create or update QuestionSubmission
                    submission, _ = QuestionSubmission.objects.get_or_create(
                        enrollment=enrollment,
                        question=question
                    )
                    submission.status = 'submitted'
                    
                    is_correct = False
                    marks_obtained = 0
                    
                    if question.question_type == 'mcq':
                        # Get correct option for this question
                        mcq_question = getattr(question, 'mcq_question', None)
                        if mcq_question:
                            mcq_submission, _ = MCQSubmission.objects.get_or_create(submission=submission)
                            if user_answer:
                                try:
                                    selected_option = MCQOption.objects.get(id=user_answer, mcq_question=mcq_question)
                                    mcq_submission.selected_option = selected_option
                                    mcq_submission.save()
                                    
                                    if selected_option.is_correct:
                                        is_correct = True
                                        marks_obtained = question.marks
                                        correct_count += 1
                                    else:
                                        # Apply negative marking if any
                                        marks_obtained = -exam.negative_marking
                                except MCQOption.DoesNotExist:
                                    pass
                    
                    elif question.question_type == 'coding':
                        # For coding, we assume it was already tested via execute_code or here we just store the last code
                        coding_submission, _ = CodingSubmission.objects.get_or_create(submission=submission)
                        if user_answer:
                            coding_submission.submitted_code = user_answer
                            coding_submission.save()
                            # Logic for auto-grading coding can be complex (running test cases), 
                            # for now we'll mark as submitted. 
                            # You might want to use the last execution result if stored.
                        
                    submission.is_correct = is_correct
                    submission.marks_obtained = marks_obtained
                    submission.save()
                    
                    total_earned_marks += marks_obtained

                # 2. Apply Violation Reductions
                # Get current violation count if not already final
                violations = enrollment.violations.all()
                violation_count = violations.count()
                
                # If violation count > threshold, calculate reduction
                score_reduction_pct = 0
                if violation_count >= exam.violation_threshold:
                    # Reduction from exam settings: reduction_per_violation (this is percentage or fixed?)
                    # The model says score_reduction_per_violation is a float. 
                    # Let's treat it as percentage of total marks.
                    score_reduction_pct = (violation_count / exam.violation_threshold) * exam.score_reduction_per_violation
                
                final_score = total_earned_marks - (exam.total_marks * (score_reduction_pct / 100))
                final_percentage = (final_score / exam.total_marks) * 100 if exam.total_marks > 0 else 0
                
                # 3. Update Enrollment
                enrollment.status = 'completed'
                enrollment.submitted_at = timezone.now()
                enrollment.time_taken_seconds = time_taken_seconds
                enrollment.score = max(0, final_score)
                enrollment.percentage = max(0, final_percentage)
                enrollment.result = 'pass' if final_percentage >= exam.passing_marks else 'fail'
                enrollment.total_violations = violation_count
                enrollment.final_violations = violation_count
                enrollment.score_reduction = score_reduction_pct
                enrollment.save()
                
                # 4. End Session if exists
                try:
                    from exam_proctor_backend.apps.proctoring.models import ExamSession
                    session = ExamSession.objects.get(enrollment=enrollment)
                    session.status = 'ended'
                    session.session_end = enrollment.submitted_at
                    session.save()
                except:
                    pass

                # Gather violation evidence
                violation_data = []
                for v in violations:
                    violation_item = {
                        'id': v.id,
                        'type': v.violation_type,
                        'severity': v.severity,
                        'detected_at': v.detected_at,
                        'screenshot': v.evidence_screenshot.url if v.evidence_screenshot else None
                    }
                    violation_data.append(violation_item)

                return Response({
                    'message': 'Exam completed successfully',
                    'result': {
                        'examTitle': exam.title,
                        'score': enrollment.percentage,
                        'totalQuestions': questions.count(),
                        'correctAnswers': correct_count,
                        'timeSpent': f"{time_taken_seconds // 60}m {time_taken_seconds % 60}s",
                        'status': enrollment.status,
                        'result': enrollment.result,
                        'violations': violation_data
                    }
                })
                
        except ExamEnrollment.DoesNotExist:
            return Response({'error': 'Not enrolled in this exam'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_exams(self, request):
        """Get exams for current user."""
        if request.user.role in ['instructor', 'admin']:
            exams = Exam.objects.filter(instructor=request.user)
        else:
            exams = Exam.objects.filter(enrollments__student=request.user).distinct()
        serializer = ExamListSerializer(exams, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def dashboard_stats(self, request):
        """Dashboard statistics for exams."""
        user = request.user
        now = timezone.now()

        if user.role in ['instructor', 'admin']:
            exams = Exam.objects.filter(instructor=user)
            active_exams = exams.filter(start_time__lte=now, end_time__gte=now).count()
            total_students = ExamEnrollment.objects.filter(exam__instructor=user).values('student').distinct().count()
            pending_reviews = ExamEnrollment.objects.filter(
                exam__instructor=user, status='submitted'
            ).count()
            avg_score = ExamEnrollment.objects.filter(
                exam__instructor=user, percentage__isnull=False
            ).aggregate(avg=Avg('percentage'))['avg'] or 0

            upcoming_exams = exams.filter(start_time__gt=now).order_by('start_time')[:5]
            recent_submissions = ExamEnrollment.objects.filter(
                exam__instructor=user
            ).exclude(status='enrolled').select_related('student', 'exam').order_by('-submitted_at')[:10]

            # Class Performance Trend (Last 15 days)
            performance_trend = []
            for i in range(14, -1, -1):
                date = (now - timedelta(days=i)).date()
                day_avg = ExamEnrollment.objects.filter(
                    exam__instructor=user,
                    submitted_at__date=date,
                    status__in=['submitted', 'completed']
                ).aggregate(avg=Avg('percentage'))['avg'] or 0
                performance_trend.append(round(day_avg, 1))

            return Response({
                'active_exams': active_exams,
                'total_students': total_students,
                'pending_reviews': pending_reviews,
                'class_average': round(avg_score, 1),
                'total_exams': exams.count(),
                'performance_trend': performance_trend,
                'upcoming_exams': ExamListSerializer(upcoming_exams, many=True).data,
                'recent_submissions': ExamEnrollmentSerializer(recent_submissions, many=True).data,
            })
        else:
            enrollments = ExamEnrollment.objects.filter(student=user)
            upcoming = Exam.objects.filter(
                status__in=['published', 'active'],
                start_time__gt=now
            ).order_by('start_time')[:5]
            avg_score = enrollments.filter(percentage__isnull=False).aggregate(avg=Avg('percentage'))['avg'] or 0

            return Response({
                'enrolled_exams': enrollments.count(),
                'completed_exams': enrollments.filter(status__in=['submitted', 'completed']).count(),
                'average_score': round(avg_score, 1),
                'upcoming_exams': ExamListSerializer(upcoming, many=True).data,
            })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def student_detailed_analytics(self, request):
        """Detailed examination-centric analytics for the student."""
        user = request.user
        enrollments = ExamEnrollment.objects.filter(student=user, status__in=['submitted', 'completed']).order_by('submitted_at')
        submissions = QuestionSubmission.objects.filter(enrollment__student=user)
        
        # 1. KPI Calculations
        total_tests = enrollments.count()
        total_questions = submissions.count()
        avg_score = enrollments.aggregate(avg=Avg('percentage'))['avg'] or 0
        
        # Calculate Speed (Average seconds per question)
        total_duration_seconds = 0
        tests_with_time = 0
        for e in enrollments:
            if e.started_at and e.submitted_at:
                total_duration_seconds += (e.submitted_at - e.started_at).total_seconds()
                tests_with_time += 1
        
        avg_speed = 0
        if total_questions > 0 and tests_with_time > 0:
            avg_speed = round(total_duration_seconds / total_questions)
        
        # 2. Score History & Speed history (Last 10)
        history_data = []
        speed_history = []
        history_labels = []
        
        for e in enrollments.order_by('-submitted_at')[:10][::-1]:
            history_data.append(round(e.percentage or 0))
            history_labels.append(e.submitted_at.strftime('%d %b'))
            
            # Individual test speed
            test_questions = QuestionSubmission.objects.filter(enrollment=e).count()
            if test_questions > 0 and e.started_at and e.submitted_at:
                test_duration = (e.submitted_at - e.started_at).total_seconds()
                speed_history.append(round(test_duration / test_questions))
            else:
                speed_history.append(0)
            
        # 3. Accuracy by Subject (Category)
        subject_accuracy = []
        subjects = Exam.objects.filter(enrollments__student=user).values_list('course__category', flat=True).distinct()
        for sub in subjects:
            if not sub: continue
            correct = submissions.filter(enrollment__exam__course__category=sub, is_correct=True).count()
            total = submissions.filter(enrollment__exam__course__category=sub).count()
            if total > 0:
                subject_accuracy.append({
                    'name': sub.capitalize(),
                    'value': round((correct / total) * 100)
                })

        # 4. Heatmap Data (Activity by day for last 6 months)
        from django.db.models.functions import TruncDate
        activity_data = enrollments.annotate(date=TruncDate('submitted_at')).values('date').annotate(count=Count('id')).order_by('date')
        
        # We'll return dates with activity counts
        heatmap = {item['date'].strftime('%Y-%m-%d'): item['count'] for item in activity_data}

        # 5. Strategic Metrics calculation
        overall_accuracy = round(submissions.filter(is_correct=True).count() / total_questions * 100) if total_questions > 0 else 0
        
        # Speed Score (Normalized: 30s or less = 100, 120s or more = 20)
        normalized_speed = 0
        if avg_speed > 0:
            normalized_speed = max(20, min(100, 120 - avg_speed))
            
        # Time Management (based on used time vs allowed duration)
        time_mgmt = 0
        time_mgmt_calcs = []
        for e in enrollments:
            if e.started_at and e.submitted_at and e.exam.duration_minutes:
                used_pct = ((e.submitted_at - e.started_at).total_seconds() / 60) / e.exam.duration_minutes
                # Best time management is using ~80-90% of time
                score = 100 - abs(85 - (used_pct * 100))
                time_mgmt_calcs.append(score)
        if time_mgmt_calcs:
            time_mgmt = sum(time_mgmt_calcs) / len(time_mgmt_calcs)

        return Response({
            'kpi': {
                'tests': total_tests,
                'questions': total_questions,
                'avg_score': round(avg_score, 1),
                'speed': f"{avg_speed}s"
            },
            'history': {
                'data': history_data,
                'speed_data': speed_history,
                'labels': history_labels
            },
            'subjects': subject_accuracy,
            'heatmap': heatmap,
            'strategic': [
                {'name': 'Accuracy', 'value': overall_accuracy},
                {'name': 'Speed', 'value': round(normalized_speed)},
                {'name': 'Concept', 'value': round(sum([s['value'] for s in subject_accuracy]) / len(subject_accuracy)) if subject_accuracy else 0},
                {'name': 'Time Mgmt', 'value': round(time_mgmt) if time_mgmt > 0 else 60},
                {'name': 'Revision', 'value': 75} # Partial Mock
            ]
        })


    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def create_from_scratch(self, request):
        """Creates an exam along with all its nested questions, options, and test cases."""
        data = request.data
        user = request.user

        if user.role not in ['instructor', 'admin']:
            return Response({'error': 'Only instructors can create exams.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            with transaction.atomic():
                # 1. Create Exam
                exam = Exam.objects.create(
                    title=data.get('title', 'Untitled Exam'),
                    description=data.get('description', ''),
                    course_id=data.get('course_id'),
                    course_name=data.get('course_name', ''),
                    instructor=user,
                    start_time=data.get('start_time', timezone.now()),
                    end_time=data.get('end_time', timezone.now() + timedelta(hours=2)),
                    duration_minutes=int(data.get('duration_minutes', 60)),
                    status=data.get('status', 'published'),
                    total_marks=float(data.get('total_marks', 100)),
                    passing_marks=float(data.get('passing_marks', 40))
                )

                # 2. Process Questions
                questions_data = data.get('questions', [])
                for idx, q_data in enumerate(questions_data):
                    q_type = q_data.get('type', 'mcq')
                    question = Question.objects.create(
                        exam=exam,
                        question_type=q_type,
                        title=f"Question {idx + 1}",
                        description=q_data.get('text', ''),
                        marks=float(q_data.get('points', 1)),
                        order=idx
                    )

                    if q_type == 'mcq':
                        mcq = MCQQuestion.objects.create(question=question)
                        options_data = q_data.get('options', [])
                        for opt_idx, opt_data in enumerate(options_data):
                            MCQOption.objects.create(
                                mcq_question=mcq,
                                option_text=opt_data.get('text', ''),
                                is_correct=opt_data.get('isCorrect', False),
                                order=opt_idx
                            )
                    
                    elif q_type == 'coding':
                        coding = CodingQuestion.objects.create(
                            question=question,
                            programming_language=q_data.get('language', 'python'),
                            starter_code=q_data.get('starterCode', ''),
                            solution_code=q_data.get('solutionCode', '')
                        )
                        test_cases_data = q_data.get('testCases', [])
                        for tc_idx, tc_data in enumerate(test_cases_data):
                            TestCase.objects.create(
                                coding_question=coding,
                                input_data=tc_data.get('input', ''),
                                expected_output=tc_data.get('output', ''),
                                is_visible=not tc_data.get('isHidden', False),
                                order=tc_idx
                            )

                serializer = ExamSerializer(exam)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def results_detail(self, request, pk=None):
        """Get detailed results for an exam including all students, scores, and violations."""
        exam = self.get_object()
        
        # Security check: Only instructor or admin
        if request.user.role not in ['instructor', 'admin']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        enrollments = ExamEnrollment.objects.filter(exam=exam).select_related('student')
        
        results = []
        for enrollment in enrollments:
            # Get session info if exists
            session = getattr(enrollment, 'session', None)
            
            # Basic student data
            student_data = {
                'id': enrollment.id,
                'student_id': enrollment.student.id,
                'name': enrollment.student.get_full_name() or enrollment.student.username,
                'email': enrollment.student.email,
                'score': enrollment.score,
                'percentage': enrollment.percentage,
                'result': enrollment.result,
                'status': enrollment.status,
                'time_taken': enrollment.time_taken_seconds,
                'violations_count': enrollment.total_violations,
                'has_session': session is not None
            }
            
            if session:
                # Add detailed session data for violations and logs
                session_serializer = ExamSessionSerializer(session)
                student_data['session'] = session_serializer.data
            
            results.append(student_data)
            
        # Calculate summary stats
        stats = enrollments.aggregate(
            avg_score=Avg('percentage'),
            max_score=Max('percentage'),
            min_score=Min('percentage'),
            pass_count=Count('pk', filter=Q(result='pass')),
            total_count=Count('pk')
        )
        
        # Proctoring summary
        total_violations = ProctoringViolation.objects.filter(enrollment__exam=exam).count()
        flagged_count = enrollments.filter(total_violations__gt=exam.violation_threshold).count()
        
        return Response({
            'exam': {
                'id': exam.id,
                'title': exam.title,
                'total_marks': exam.total_marks,
                'passing_marks': exam.passing_marks,
                'violation_threshold': exam.violation_threshold
            },
            'summary': {
                'total_students': stats['total_count'],
                'pass_count': stats['pass_count'],
                'avg_score': round(stats['avg_score'] or 0, 1),
                'max_score': stats['max_score'],
                'min_score': stats['min_score'],
                'total_violations': total_violations,
                'flagged_students': flagged_count
            },
            'students': results
        })


class ExamEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = ExamEnrollment.objects.all()
    serializer_class = ExamEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['instructor', 'admin']:
            return ExamEnrollment.objects.filter(exam__instructor=user).select_related('student', 'exam')
        return ExamEnrollment.objects.filter(student=user).select_related('exam')
