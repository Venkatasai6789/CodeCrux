from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Course(models.Model):
    """Course model for organizing exams and student learning."""
    DIFFICULTY_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )
    CATEGORY_CHOICES = (
        ('coding', 'Coding'),
        ('science', 'Science'),
        ('design', 'Design'),
        ('math', 'Math'),
        ('general', 'General'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses_taught')
    thumbnail = models.URLField(blank=True, default='')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    total_lessons = models.IntegerField(default=10)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class CourseEnrollment(models.Model):
    """Tracks student enrollment and progress in courses."""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    completed_lessons = models.IntegerField(default=0)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'course_enrollments'
        unique_together = ('student', 'course')
        ordering = ['-last_accessed']

    def __str__(self):
        return f"{self.student.username} - {self.course.title}"

    @property
    def progress(self):
        if self.course.total_lessons == 0:
            return 0
        return round((self.completed_lessons / self.course.total_lessons) * 100)


class Exam(models.Model):
    """Exam model for storing exam configurations and metadata."""
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('active', 'Active'),
        ('closed', 'Closed'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    course_name = models.CharField(max_length=255, blank=True, default='')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='exams')
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exams')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Exam Timing
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration_minutes = models.IntegerField(help_text="Total exam duration in minutes")

    # Configuration
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    total_marks = models.FloatField(default=100)
    passing_marks = models.FloatField(default=40)
    negative_marking = models.FloatField(default=0)

    # Proctoring Settings
    enable_camera = models.BooleanField(default=True)
    enable_mic = models.BooleanField(default=True)
    enable_screenshot = models.BooleanField(default=True)
    record_screen = models.BooleanField(default=True)
    record_video = models.BooleanField(default=True)
    fullscreen_required = models.BooleanField(default=True)
    tab_switch_allowed = models.BooleanField(default=False)

    # Violation Settings
    violation_threshold = models.IntegerField(default=3)
    score_reduction_per_violation = models.FloatField(default=10)

    # Additional settings
    allow_multiple_attempts = models.BooleanField(default=False)
    show_answers_after_exam = models.BooleanField(default=True)
    shuffle_questions = models.BooleanField(default=True)
    shuffle_options = models.BooleanField(default=True)

    class Meta:
        db_table = 'exams'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['instructor']),
            models.Index(fields=['status']),
            models.Index(fields=['start_time']),
        ]

    def __str__(self):
        return self.title

    @property
    def is_active(self):
        now = timezone.now()
        return self.start_time <= now <= self.end_time

    @property
    def is_upcoming(self):
        return timezone.now() < self.start_time

    @property
    def is_closed(self):
        return timezone.now() > self.end_time


class ExamEnrollment(models.Model):
    """Model to track student enrollment in exams."""
    STATUS_CHOICES = (
        ('enrolled', 'Enrolled'),
        ('started', 'Started'),
        ('submitted', 'Submitted'),
        ('completed', 'Completed'),
        ('withdrawn', 'Withdrawn'),
    )

    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')

    enrolled_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(blank=True, null=True)
    submitted_at = models.DateTimeField(blank=True, null=True)

    score = models.FloatField(blank=True, null=True)
    percentage = models.FloatField(blank=True, null=True)
    result = models.CharField(max_length=10, choices=[('pass', 'Pass'), ('fail', 'Fail')], blank=True, null=True)

    total_violations = models.IntegerField(default=0)
    final_violations = models.IntegerField(default=0)
    score_reduction = models.FloatField(default=0)
    is_blocked = models.BooleanField(default=False)
    is_auto_submitted = models.BooleanField(default=False)
    time_taken_seconds = models.IntegerField(default=0, help_text="Total time taken by student in seconds")
    integrity_score = models.FloatField(default=100.0, help_text="Calculated integrity score based on violations")

    class Meta:
        db_table = 'exam_enrollments'
        unique_together = ('exam', 'student')
        ordering = ['-enrolled_at']
        indexes = [
            models.Index(fields=['exam', 'student']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.student.username} - {self.exam.title}"

    @property
    def is_submitted(self):
        return self.status == 'submitted'
