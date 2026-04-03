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
from exam_proctor_backend.apps.proctoring.models import ProctoringViolation

User = get_user_model()

def test_violation_save():
    print("🧪 Testing Violation Save Path...")
    
    # 1. Get Test Entities
    student = User.objects.filter(role='student').first()
    enrollment = ExamEnrollment.objects.filter(student=student).first()
    
    if not enrollment:
        print("❌ No enrollment found to test with.")
        return

    print(f"✅ Using Student: {student.username} | Exam: {enrollment.exam.title}")

    # 2. Create Violation with Image
    dummy_img = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")
    
    violation = ProctoringViolation.objects.create(
        enrollment=enrollment,
        violation_type='tab_switch',
        description='Diagnostic test'
    )
    
    print(f"✅ Created Violation ID: {violation.id}")
    
    # Manually save image to check path generation
    filename = "test_diag.png"
    violation.evidence_screenshot.save(filename, ContentFile(dummy_img))
    
    print(f"✅ Screenshot Saved!")
    print(f"📸 DB Name: {violation.evidence_screenshot.name}")
    print(f"📸 File Path: {violation.evidence_screenshot.path}")
    print(f"📸 File Exists: {os.path.exists(violation.evidence_screenshot.path)}")

if __name__ == '__main__':
    test_violation_save()
