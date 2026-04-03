
import os
import base64
from django.core.files.base import ContentFile
from django.utils import timezone
from exam_proctor_backend.apps.exams.models import ExamEnrollment
from exam_proctor_backend.apps.proctoring.models import ProctoringViolation, ExamSession

# 1. Get a test enrollment
enrollment_id = 112
try:
    enrollment = ExamEnrollment.objects.get(id=enrollment_id)
    print(f"Testing for student: {enrollment.student.username} (ID: {enrollment_id})")
except ExamEnrollment.DoesNotExist:
    print("Enrollment 112 not found. Check ID.")
    exit(1)

# 2. Mock Base64 Image (Small 1x1 Red PNG)
red_dot_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

# 3. Use the logic from our views.py to save the violation
try:
    # Ensure session exists
    session, _ = ExamSession.objects.get_or_create(
        enrollment=enrollment,
        defaults={'status': 'active'}
    )

    violation = ProctoringViolation.objects.create(
        enrollment=enrollment,
        violation_type='mobile_phone',
        description='CLI INTEGRITY TEST - PHONE DETECTED',
        severity='high'
    )

    img_str = red_dot_b64
    image_content = base64.b64decode(img_str)
    filename = f"test_debug_{timezone.now().strftime('%H%M%S')}.png"
    violation.evidence_screenshot.save(filename, ContentFile(image_content), save=True)

    print(f"SUCCESS: Violation {violation.id} created with snapshot.")
    print(f"Snapshot path: {violation.evidence_screenshot.name}")
    print(f"Snapshot URL: {violation.evidence_screenshot.url if violation.evidence_screenshot else 'None'}")

except Exception as e:
    print(f"FAILURE: {e}")
