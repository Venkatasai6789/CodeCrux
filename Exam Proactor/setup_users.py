"""
Setup script to ensure test users have proper passwords for login testing.
"""
import os
import sys
import django

# Add project to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_proctor_backend.core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Ensure admin user has password
try:
    admin = User.objects.get(username='admin')
    admin.set_password('admin123')
    admin.role = 'instructor'
    admin.first_name = 'Professor'
    admin.last_name = 'Smith'
    admin.save()
    print(f"Updated admin user: username=admin, password=admin123, role=instructor")
except User.DoesNotExist:
    admin = User.objects.create_user(
        username='admin',
        email='admin@sparkless.com',
        password='admin123',
        role='instructor',
        first_name='Professor',
        last_name='Smith',
    )
    print(f"Created admin user: username=admin, password=admin123, role=instructor")

# Ensure student user exists
try:
    student = User.objects.get(username='student')
    student.set_password('student123')
    student.role = 'student'
    student.first_name = 'Arka'
    student.last_name = 'Maulana'
    student.save()
    print(f"Updated student user: username=student, password=student123, role=student")
except User.DoesNotExist:
    student = User.objects.create_user(
        username='student',
        email='student@sparkless.com',
        password='student123',
        role='student',
        first_name='Arka',
        last_name='Maulana',
    )
    print(f"Created student user: username=student, password=student123, role=student")

# Update existing exams with course_name
from exam_proctor_backend.apps.exams.models import Exam
exams = Exam.objects.all()
for exam in exams:
    if not exam.course_name:
        if 'python' in exam.title.lower():
            exam.course_name = 'CS101: Python Programming'
        elif 'java' in exam.title.lower():
            exam.course_name = 'CS201: Java Development'
        else:
            exam.course_name = 'General Course'
        exam.save()
        print(f"Updated exam '{exam.title}' with course_name='{exam.course_name}'")

# List all users
print("\n--- ALL USERS ---")
for u in User.objects.all():
    print(f"  id={u.id}, username={u.username}, role={u.role}, name={u.get_full_name()}")

print("\n--- ALL EXAMS ---")
for e in Exam.objects.all():
    print(f"  id={e.id}, title={e.title}, course={e.course_name}, status={e.status}")

print("\nSetup complete!")
