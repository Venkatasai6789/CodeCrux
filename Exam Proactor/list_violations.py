import os
import django
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.join(os.getcwd(), 'exam_proctor_backend'))
django.setup()

from exam_proctor_backend.apps.proctoring.models import ProctoringViolation

def list_violations():
    print("--- 📸 ALL VIOLATION SNAPSHOTS IN DB ---")
    violations = ProctoringViolation.objects.filter(evidence_screenshot__isnull=False)
    
    if not violations:
        print("No violations with snapshots found.")
        return

    for v in violations:
        print(f"ID: {v.id}")
        print(f"  User: {v.enrollment.student.username}")
        print(f"  Exam: {v.enrollment.exam.title}")
        print(f"  DB Name: {v.evidence_screenshot.name}")
        try:
            print(f"  Disk Path: {v.evidence_screenshot.path}")
            print(f"  Exists: {os.path.exists(v.evidence_screenshot.path)}")
        except Exception as e:
            print(f"  Error getting path: {e}")
        print("-" * 20)

if __name__ == '__main__':
    list_violations()
