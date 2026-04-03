from django.db import models
from django.contrib.auth import get_user_model
from exam_proctor_backend.apps.exams.models import ExamEnrollment

User = get_user_model()

class ProctoringViolation(models.Model):
    """Model to track proctoring violations."""
    VIOLATION_TYPE_CHOICES = (
        ('phone_detected', 'Phone/Mobile Device Detected'),
        ('gadget_detected', 'Electric Gadget Detected'),
        ('tab_switch', 'Tab/Window Switched'),
        ('fullscreen_exit', 'Exited Fullscreen'),
        ('camera_off', 'Camera Turned Off'),
        ('mic_off', 'Microphone Turned Off'),
        ('suspicious_activity', 'Suspicious Activity Detected'),
        ('unusual_behavior', 'Unusual Behavior'),
        ('multiple_face', 'Multiple Faces Detected'),
        ('no_face', 'Face Not Detected'),
    )
    
    enrollment = models.ForeignKey(ExamEnrollment, on_delete=models.CASCADE, related_name='violations')
    violation_type = models.CharField(max_length=50, choices=VIOLATION_TYPE_CHOICES)
    
    description = models.TextField(blank=True)
    severity = models.CharField(
        max_length=10,
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')],
        default='medium'
    )
    
    evidence_screenshot = models.ImageField(upload_to='violations/screenshots/', blank=True, null=True)
    evidence_video_frame = models.FileField(upload_to='violations/frames/', blank=True, null=True)
    
    detected_at = models.DateTimeField(auto_now_add=True)
    reviewed = models.BooleanField(default=False)
    reviewer_notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'proctoring_violations'
        ordering = ['-detected_at']
        indexes = [
            models.Index(fields=['enrollment']),
            models.Index(fields=['violation_type']),
            models.Index(fields=['severity']),
        ]

    def __str__(self):
        return f"{self.get_violation_type_display()} - {self.enrollment.student.username}"


class ExamSession(models.Model):
    """Model to track exam sessions and recording data."""
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('resumed', 'Resumed'),
        ('ended', 'Ended'),
    )
    
    enrollment = models.OneToOneField(ExamEnrollment, on_delete=models.CASCADE, related_name='session')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Recording Information
    screen_recording_path = models.FileField(upload_to='recordings/screen/', blank=True, null=True)
    video_recording_path = models.FileField(upload_to='recordings/video/', blank=True, null=True)
    audio_recording_path = models.FileField(upload_to='recordings/audio/', blank=True, null=True)
    
    # Camera and Mic Status
    camera_enabled = models.BooleanField(default=True)
    mic_enabled = models.BooleanField(default=True)
    
    # Session Timing
    session_start = models.DateTimeField(auto_now_add=True)
    session_end = models.DateTimeField(blank=True, null=True)
    total_session_duration_seconds = models.IntegerField(default=0)
    
    # Activity Logs
    total_violations = models.IntegerField(default=0)
    total_screenshots = models.IntegerField(default=0)
    
    # Performance Metrics
    fps_average = models.FloatField(default=0, help_text="Average Frames Per Second")
    connection_quality = models.CharField(
        max_length=20,
        choices=[('excellent', 'Excellent'), ('good', 'Good'), ('fair', 'Fair'), ('poor', 'Poor')],
        default='good'
    )
    
    # Additional Data
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    device_info = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'exam_sessions'
        indexes = [
            models.Index(fields=['enrollment']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Session - {self.enrollment.student.username} - {self.enrollment.exam.title}"


class ActivityLog(models.Model):
    """Model to log all student activities during exam."""
    ACTIVITY_TYPE_CHOICES = (
        ('question_viewed', 'Question Viewed'),
        ('answer_submitted', 'Answer Submitted'),
        ('code_executed', 'Code Executed'),
        ('camera_status_changed', 'Camera Status Changed'),
        ('mic_status_changed', 'Microphone Status Changed'),
        ('fullscreen_changed', 'Fullscreen Status Changed'),
        ('window_switched', 'Window Switched'),
        ('copy_paste', 'Copy-Paste Activity'),
        ('keyboard_activity', 'Keyboard Activity'),
        ('mouse_activity', 'Mouse Activity'),
    )
    
    session = models.ForeignKey(ExamSession, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPE_CHOICES)
    
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'activity_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['session', 'activity_type']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"{self.get_activity_type_display()} - {self.session.enrollment.student.username}"


class ScreenCapture(models.Model):
    """Model to store screenshots taken during exam."""
    session = models.ForeignKey(ExamSession, on_delete=models.CASCADE, related_name='screen_captures')
    
    image = models.ImageField(upload_to='captures/')
    timestamp = models.DateTimeField(auto_now_add=True)
    reason = models.CharField(
        max_length=100,
        choices=[
            ('violation', 'Violation Detected'),
            ('random', 'Random Check'),
            ('flagged', 'Flagged Activity'),
        ],
        default='random'
    )
    
    flagged = models.BooleanField(default=False)
    flag_reason = models.TextField(blank=True)
    
    class Meta:
        db_table = 'screen_captures'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['session']),
            models.Index(fields=['reason']),
        ]

    def __str__(self):
        return f"Screenshot - {self.session.enrollment.student.username}"
