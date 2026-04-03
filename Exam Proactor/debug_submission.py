
import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_proctor_backend.settings')
django.setup()

from exam_proctor_backend.apps.exams.models import Exam, ExamEnrollment
from django.contrib.auth import get_user_model

User = get_user_model()

print("--- DEBUGGING SUBMISSIONS ---")

# 1. Check user hitesh
try:
    hitesh = User.objects.get(username='hitesh')
    print(f"User 'hitesh' found: id={hitesh.id}, role={hitesh.role}")
except User.DoesNotExist:
    print("User 'hitesh' NOT found.")
    hitesh = None

# 2. Check all enrollments for hitesh
if hitesh:
    enrollments = ExamEnrollment.objects.filter(student=hitesh)
    print(f"Enrollments for hitesh: {enrollments.count()}")
    for e in enrollments:
        print(f"  Exam: {e.exam.title} (ID: {e.exam.id}), Status: {e.status}, Score: {e.score}, Integrity: {e.integrity_score}")
else:
    print("Cannot check enrollments without hitesh user.")

# 3. Check all exams
exams = Exam.objects.all()
print(f"\nTotal Exams: {exams.count()}")
for ex in exams:
    instructor = ex.instructor.username if ex.instructor else "None"
    print(f"  ID: {ex.id}, Title: {ex.title}, Instructor: {instructor}, Status: {ex.status}")

# 4. Check current user Pardhu if possible
try:
    pardhu = User.objects.get(username='pardhu')
    print(f"\nUser 'pardhu' found: id={pardhu.id}, role={pardhu.role}")
except User.DoesNotExist:
    print("\nUser 'pardhu' NOT found.")

