from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import (
    ProctoringViolation, ExamSession, ActivityLog, ScreenCapture
)
from .serializers import (
    ProctoringViolationSerializer, ExamSessionSerializer,
    ActivityLogSerializer, ScreenCaptureSerializer
)

class ProctoringViolationViewSet(viewsets.ModelViewSet):
    queryset = ProctoringViolation.objects.all()
    serializer_class = ProctoringViolationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'instructor':
            return ProctoringViolation.objects.filter(enrollment__exam__instructor=user)
        return ProctoringViolation.objects.filter(enrollment__student=user)

    @action(detail=False, methods=['post'])
    def report_violation(self, request):
        """Report a new violation."""
        violation_type = request.data.get('violation_type')
        enrollment_id = request.data.get('enrollment_id')
        description = request.data.get('description', '')
        severity = request.data.get('severity', 'medium')

        try:
            violation = ProctoringViolation.objects.create(
                enrollment_id=enrollment_id,
                violation_type=violation_type,
                description=description,
                severity=severity
            )

            # Handle file uploads if present
            if 'evidence_screenshot' in request.FILES:
                violation.evidence_screenshot = request.FILES['evidence_screenshot']
            if 'evidence_video_frame' in request.FILES:
                violation.evidence_video_frame = request.FILES['evidence_video_frame']
            violation.save()

            # Update violation count
            enrollment = violation.enrollment
            enrollment.total_violations += 1
            if enrollment.total_violations >= enrollment.exam.violation_threshold:
                enrollment.final_violations = enrollment.total_violations
                # Calculate score reduction
                reduction_percentage = (enrollment.final_violations / enrollment.exam.violation_threshold) * enrollment.exam.score_reduction_per_violation
                enrollment.score_reduction = reduction_percentage
            enrollment.save()

            serializer = ProctoringViolationSerializer(violation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def clear_violations(self, request):
        """Faculty can clear violations for a student (unblock)."""
        user = request.user
        enrollment_id = request.data.get('enrollment_id')
        
        # Check if user is instructor
        if user.role != 'instructor':
            return Response({'error': 'Only instructors can clear violations'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            from exam_proctor_backend.apps.exams.models import ExamEnrollment
            enrollment = ExamEnrollment.objects.get(id=enrollment_id)
            
            # Check if instructor owns the exam
            if enrollment.exam.instructor != user:
                return Response({'error': 'You can only manage your own exam violations'}, status=status.HTTP_403_FORBIDDEN)
            
            # Clear all violations for this enrollment
            violations = ProctoringViolation.objects.filter(enrollment=enrollment)
            violations.delete()
            
            # Reset violation counts
            enrollment.total_violations = 0
            enrollment.final_violations = 0
            enrollment.score_reduction = 0
            enrollment.save()
            
            return Response({'message': f'Violations cleared for student. They can now continue the exam.'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ExamSessionViewSet(viewsets.ModelViewSet):
    queryset = ExamSession.objects.all()
    serializer_class = ExamSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'instructor':
            return ExamSession.objects.filter(enrollment__exam__instructor=user)
        return ExamSession.objects.filter(enrollment__student=user)

    @action(detail=False, methods=['post'])
    def start_session(self, request):
        """Start exam session."""
        enrollment_id = request.data.get('enrollment_id')
        ip_address = self.request.META.get('REMOTE_ADDR')
        user_agent = self.request.META.get('HTTP_USER_AGENT', '')
        device_info = request.data.get('device_info', {})

        try:
            session, created = ExamSession.objects.get_or_create(
                enrollment_id=enrollment_id,
                defaults={
                    'ip_address': ip_address,
                    'user_agent': user_agent,
                    'device_info': device_info
                }
            )
            serializer = ExamSessionSerializer(session)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def end_session(self, request, pk=None):
        """End exam session."""
        session = self.get_object()
        session.status = 'ended'
        session.session_end = timezone.now()
        session.total_session_duration_seconds = int(
            (session.session_end - session.session_start).total_seconds()
        )
        session.save()
        serializer = ExamSessionSerializer(session)
        return Response(serializer.data)

class ActivityLogViewSet(viewsets.ModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ActivityLog.objects.filter(session__enrollment__student=self.request.user)

    @action(detail=False, methods=['post'])
    def log_activity(self, request):
        """Log student activity."""
        session_id = request.data.get('session_id')
        activity_type = request.data.get('activity_type')
        description = request.data.get('description', '')
        metadata = request.data.get('metadata', {})

        try:
            activity = ActivityLog.objects.create(
                session_id=session_id,
                activity_type=activity_type,
                description=description,
                metadata=metadata
            )
            serializer = ActivityLogSerializer(activity)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ScreenCaptureViewSet(viewsets.ModelViewSet):
    queryset = ScreenCapture.objects.all()
    serializer_class = ScreenCaptureSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ScreenCapture.objects.filter(session__enrollment__student=self.request.user)

    @action(detail=False, methods=['post'])
    def capture_screenshot(self, request):
        """Capture screenshot during exam."""
        session_id = request.data.get('session_id')
        reason = request.data.get('reason', 'random')

        try:
            if 'image' not in request.FILES:
                return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

            capture = ScreenCapture.objects.create(
                session_id=session_id,
                image=request.FILES['image'],
                reason=reason
            )

            # Update session screenshot count
            session = capture.session
            session.total_screenshots += 1
            session.save()

            serializer = ScreenCaptureSerializer(capture)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
