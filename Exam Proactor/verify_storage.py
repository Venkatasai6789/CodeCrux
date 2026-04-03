import os
import django
import sys
import base64
from django.utils import timezone
from django.core.files.base import ContentFile
from datetime import timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.join(os.getcwd(), 'exam_proctor_backend'))
django.setup()

from django.contrib.auth import get_user_model
from exam_proctor_backend.apps.exams.models import Exam, ExamEnrollment, Course
from exam_proctor_backend.apps.proctoring.models import ExamSession, ProctoringViolation
from rest_framework.test import APIRequestFactory, force_authenticate
from exam_proctor_backend.apps.exams.views import ExamViewSet
from exam_proctor_backend.apps.proctoring.views import ProctoringViolationViewSet

User = get_user_model()

def verify_submission_and_storage():
    print("🧪 Verifying Submission and Data Storage...")
    
    # 1. Setup/Get Test Entities
    faculty = User.objects.get(username='faculty_tester')
    student, _ = User.objects.get_or_create(username='submit_test_student', defaults={'role': 'student'})
    student.set_password('password123')
    student.save()
    
    course = Course.objects.filter(instructor=faculty).first()
    exam = Exam.objects.create(
        title='Submission Storage Test',
        instructor=faculty,
        course=course,
        start_time=timezone.now() - timedelta(hours=1),
        end_time=timezone.now() + timedelta(hours=1),
        duration_minutes=60,
        status='active',
        total_marks=100,
        passing_marks=40,
        violation_threshold=3
    )
    
    enrollment = ExamEnrollment.objects.create(exam=exam, student=student, status='started', started_at=timezone.now())
    print(f"✅ Created Exam '{exam.title}' and Enrollment for '{student.username}'")

    # 2. Simulate Reporting a Violation with a dummy Base64 Snapshot
    dummy_base64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc_ZntnZ3d3d3d5fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX198"
    
    factory = APIRequestFactory()
    violation_view = ProctoringViolationViewSet.as_view({'post': 'report_violation'})
    
    v_data = {
        'enrollment_id': enrollment.id,
        'violation_type': 'tab_switch',
        'description': 'Test tab switch detection',
        'severity': 'high',
        'snapshot': dummy_base64
    }
    
    v_request = factory.post('/api/proctoring/violations/report_violation/', v_data, format='json')
    force_authenticate(v_request, user=student)
    v_response = violation_view(v_request)
    
    if v_response.status_code == 201:
        print(f"✅ Violation Reported and Snapshot Saved (API Response: 201)")
    else:
        print(f"❌ Failed to report violation: {v_response.data}")
        return

    # 3. Simulate Exam Submission (Auto-Submission scenario)
    exam_view = ExamViewSet.as_view({'post': 'submit'})
    s_data = {
        'answers': {}, # Empty answers
        'time_taken_seconds': 120,
        'is_auto_submit': True
    }
    
    s_request = factory.post(f'/api/exams/exams/{exam.id}/submit/', s_data, format='json')
    force_authenticate(s_request, user=student)
    s_response = exam_view(s_request, pk=exam.id)
    
    if s_response.status_code == 200:
        print(f"✅ Exam Submitted Successfully (API Response: 200)")
    else:
        print(f"❌ Failed to submit exam: {s_response.data}")
        return

    # 4. DATABASE INTEGRITY CHECK
    print("\n🔍 Querying Database for Persistence Verification...")
    
    # Check Enrollment Storage
    enrollment.refresh_from_db()
    print(f"📊 Enrollment Status: {enrollment.status} (Expected: completed)")
    print(f"📊 Total Violations Recorded: {enrollment.total_violations} (Expected: 1)")
    print(f"📊 Final Score: {enrollment.score} (Expected: calculated based on reductions)")
    print(f"📊 Integrity Score: {enrollment.integrity_score} (Expected: < 100)")
    print(f"📊 Auto-Submitted: {enrollment.is_auto_submitted} (Expected: True)")
    
    persist_ok = (enrollment.status == 'completed' and 
                  enrollment.total_violations == 1 and 
                  enrollment.is_auto_submitted == True)
    
    if persist_ok:
        print("✅ DATABASE PASS: Enrollment results correctly stored.")
    else:
        print("❌ DATABASE FAIL: Enrollment results not stored as expected.")

    # Check Violation Snapshot Storage
    violation = ProctoringViolation.objects.filter(enrollment=enrollment).first()
    if violation and violation.evidence_screenshot:
        screenshot_path = violation.evidence_screenshot.path
        file_exists = os.path.exists(screenshot_path)
        print(f"📸 Violation Recorded: {violation.violation_type}")
        print(f"📸 Screenshot DB Path: {violation.evidence_screenshot.name}")
        print(f"📸 Screenshot Absolute Path: {screenshot_path}")
        print(f"📸 Physical File Exists: {file_exists}")
        
        if file_exists:
            print("✅ DATABASE PASS: Violation snapshot correctly stored on disk and in DB.")
        else:
            print("❌ DATABASE FAIL: Snapshot path exists in DB but file missing from disk.")
    else:
        print("❌ DATABASE FAIL: No violation or screenshot found in DB.")

if __name__ == '__main__':
    verify_submission_and_storage()
