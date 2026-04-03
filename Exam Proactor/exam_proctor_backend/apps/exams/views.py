from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Avg, Count, Q
from .models import Exam, ExamEnrollment, Course, CourseEnrollment
from .serializers import (
    ExamSerializer, ExamListSerializer, ExamEnrollmentSerializer,
    CourseSerializer, CourseEnrollmentSerializer
)


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
        """Submit exam."""
        exam = self.get_object()
        try:
            enrollment = ExamEnrollment.objects.get(exam=exam, student=request.user)
            enrollment.status = 'submitted'
            enrollment.submitted_at = timezone.now()
            enrollment.save()
            return Response({'message': 'Exam submitted'})
        except ExamEnrollment.DoesNotExist:
            return Response({'error': 'Not enrolled in this exam'}, status=status.HTTP_400_BAD_REQUEST)

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

            return Response({
                'active_exams': active_exams,
                'total_students': total_students,
                'pending_reviews': pending_reviews,
                'class_average': round(avg_score, 1),
                'total_exams': exams.count(),
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


class ExamEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = ExamEnrollment.objects.all()
    serializer_class = ExamEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['instructor', 'admin']:
            return ExamEnrollment.objects.filter(exam__instructor=user).select_related('student', 'exam')
        return ExamEnrollment.objects.filter(student=user).select_related('exam')
