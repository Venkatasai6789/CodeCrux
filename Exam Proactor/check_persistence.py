import os
import django
import sys
from datetime import timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.join(os.getcwd(), 'exam_proctor_backend'))
django.setup()

from django.contrib.auth import get_user_model
from exam_proctor_backend.apps.exams.models import Exam, ExamEnrollment
from exam_proctor_backend.apps.proctoring.models import ProctoringViolation

def check_persistence():
    print("--- 🏁 DATABASE PERSISTENCE REPORT ---")
    
    # Get the latest completed enrollment
    enrollment = ExamEnrollment.objects.filter(status='completed').order_by('-submitted_at').first()
    
    if not enrollment:
        print("❌ No completed exam enrollments found.")
        return

    print(f"✅ FOUND COMPLETED ENROLLMENT:")
    print(f"   - Student: {enrollment.student.username}")
    print(f"   - Exam: {enrollment.exam.title}")
    print(f"   - Status: {enrollment.status}")
    print(f"   - Score: {enrollment.score} / {enrollment.exam.total_marks} ({enrollment.percentage}%)")
    print(f"   - Result: {enrollment.result}")
    print(f"   - Integrity Score: {enrollment.integrity_score}")
    print(f"   - Total Violations: {enrollment.total_violations}")
    print(f"   - Submitted At: {enrollment.submitted_at}")

    # Check violations for THIS enrollment
    violations = ProctoringViolation.objects.filter(enrollment=enrollment)
    print(f"\n✅ FOUND {violations.count()} VIOLATIONS:")
    
    for v in violations:
        print(f"   - ID: {v.id}")
        print(f"   - Type: {v.violation_type}")
        print(f"   - Severity: {v.severity}")
        print(f"   - Detected At: {v.detected_at}")
        
        if v.evidence_screenshot:
            path = v.evidence_screenshot.path
            exists = os.path.exists(path)
            print(f"   - Snapshot Path: {v.evidence_screenshot.name}")
            print(f"   - Absolute Path: {path}")
            print(f"   - File Exists on Disk: {'YES' if exists else 'NO'}")
        else:
            print("   - Snapshot: NONE")

if __name__ == '__main__':
    check_persistence()
