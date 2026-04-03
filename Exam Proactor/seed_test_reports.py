import os
import django
import random
from django.utils import timezone
from datetime import timedelta

import sys

# Set up Django environment
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'exam_proctor_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from exam_proctor_backend.apps.exams.models import Exam, ExamEnrollment, Course
from exam_proctor_backend.apps.proctoring.models import ExamSession, ProctoringViolation, ActivityLog

User = get_user_model()

def seed_test_scenarios():
    print("🚀 Starting Report Enhancement Seeding...")
    
    # 1. Get or Create Faculty
    faculty, _ = User.objects.get_or_create(
        username='faculty_tester',
        defaults={
            'email': 'faculty@codecrux.com',
            'role': 'faculty',
            'is_staff': True,
            'first_name': 'Test',
            'last_name': 'Faculty'
        }
    )
    faculty.set_password('password123')
    faculty.save()

    # 2. Get or Create Course
    course, _ = Course.objects.get_or_create(
        title='Proctoring Integrity 101',
        defaults={
            'description': 'Advanced course on exam integrity',
            'instructor': faculty,
            'category': 'science'
        }
    )

    # 3. Create a Specific Exam for testing
    exam_title = 'Report Enhancement Test Exam'
    # Delete existing if any to start fresh
    Exam.objects.filter(title=exam_title).delete()
    
    exam = Exam.objects.create(
        title=exam_title,
        description='Special exam to test admin reports enhancement.',
        course=course,
        instructor=faculty,
        start_time=timezone.now() - timedelta(hours=1),
        end_time=timezone.now() + timedelta(hours=5),
        duration_minutes=60,
        status='active',
        total_marks=100,
        passing_marks=40,
        violation_threshold=3
    )
    print(f"✅ Created Exam: {exam.title}")

    # 4. Define Student Scenarios
    scenarios = [
        {
            'username': 'student_clean',
            'name': 'Clean Student',
            'status': 'completed',
            'violations': 0,
            'activities': ['question_viewed', 'answer_submitted'],
            'score': 85
        },
        {
            'username': 'student_minor',
            'name': 'Minor Violator',
            'status': 'completed',
            'violations': 2,
            'violation_types': ['tab_switch', 'fullscreen_exit'],
            'activities': ['window_switched', 'fullscreen_changed'],
            'score': 72
        },
        {
            'username': 'student_major',
            'name': 'Major Violator',
            'status': 'completed',
            'violations': 5,
            'violation_types': ['phone_detected', 'multiple_face', 'no_face'],
            'activities': ['camera_status_changed', 'window_switched'],
            'score': 45,
            'auto_submit': True
        },
        {
            'username': 'student_blocked',
            'name': 'Blocked Student',
            'status': 'started',
            'violations': 4,
            'violation_types': ['gadget_detected'],
            'activities': ['keyboard_activity'],
            'score': 0,
            'blocked': True
        },
        {
            'username': 'student_active',
            'name': 'Active Student',
            'status': 'started',
            'violations': 1,
            'violation_types': ['unusual_behavior'],
            'activities': ['question_viewed'],
            'score': None
        }
    ]

    for sc in scenarios:
        student, _ = User.objects.get_or_create(
            username=sc['username'],
            defaults={
                'email': f"{sc['username']}@example.com",
                'role': 'student',
                'first_name': sc['name'].split()[0],
                'last_name': sc['name'].split()[1]
            }
        )
        student.set_password('password123')
        student.save()

        # Create Enrollment
        enrollment = ExamEnrollment.objects.create(
            exam=exam,
            student=student,
            status=sc['status'],
            started_at=timezone.now() - timedelta(minutes=45),
            submitted_at=timezone.now() if sc['status'] == 'completed' else None,
            score=sc['score'],
            percentage=sc['score'],
            result='pass' if (sc['score'] or 0) >= 40 else 'fail',
            total_violations=sc['violations'],
            is_blocked=sc.get('blocked', False),
            is_auto_submitted=sc.get('auto_submit', False)
        )

        # Create Session
        session = ExamSession.objects.create(
            enrollment=enrollment,
            status='ended' if sc['status'] == 'completed' else 'active',
            session_start=enrollment.started_at,
            session_end=enrollment.submitted_at,
            total_violations=sc['violations'],
            ip_address='192.168.1.1',
            device_info={'browser': 'Chrome', 'os': 'Windows'}
        )

        # Create Violations
        if sc['violations'] > 0:
            for i in range(sc['violations']):
                v_type = random.choice(sc.get('violation_types', ['unusual_behavior']))
                ProctoringViolation.objects.create(
                    enrollment=enrollment,
                    violation_type=v_type,
                    description=f"Automated test detection for {v_type}",
                    severity='high' if i % 2 == 0 else 'medium',
                    detected_at=timezone.now() - timedelta(minutes=random.randint(1, 40))
                )

        # Create Activities
        for act_type in sc.get('activities', []):
            ActivityLog.objects.create(
                session=session,
                activity_type=act_type,
                description=f"Student performed {act_type}",
                timestamp=timezone.now() - timedelta(minutes=random.randint(1, 40))
            )

        print(f"   👤 Seeded Student: {sc['name']} ({sc['status']}) - {sc['violations']} Violations")

    print(f"\n✨ Seeding Complete! Exam ID: {exam.id}")
    print(f"🔗 Admin URL: http://localhost:5173/#/exam-analytics?id={exam.id}")

if __name__ == '__main__':
    seed_test_scenarios()
