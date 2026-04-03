import os
import sys
import django
from django.utils import timezone
from datetime import timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_proctor_backend.core.settings')
django.setup()

from exam_proctor_backend.apps.exams.models import Exam, ExamEnrollment, Course
from exam_proctor_backend.apps.questions.models import Question, MCQQuestion, MCQOption, CodingQuestion
from django.contrib.auth import get_user_model

User = get_user_model()

def finalize_exam_11():
    print("--- Finalizing Exam 11 ---")
    
    # 1. Ensure Alex Johnson exists
    student = User.objects.filter(username__icontains='alex').first()
    if not student:
        student = User.objects.filter(role='student').first()
    
    if not student:
        print("❌ No student found to enroll.")
        return

    print(f"✅ Found student: {student.username}")

    # 2. Get or Create Course
    instructor = User.objects.filter(role='instructor').first() or User.objects.filter(is_superuser=True).first()
    course, _ = Course.objects.get_or_create(
        title="Digital Logic & Processor Design",
        defaults={
            'description': 'Advanced digital logic and microprocessor architecture.',
            'category': 'coding',
            'instructor': instructor,
            'is_published': True
        }
    )

    # 3. Get or Create Exam 11
    exam, created = Exam.objects.update_or_create(
        id=11,
        defaults={
            'title': "Digital Logic & Processor Design Final",
            'course': course,
            'course_name': course.title,
            'description': "Comprehensive final assessment for CS301.",
            'duration_minutes': 90,
            'start_time': timezone.now() - timedelta(hours=1),
            'end_time': timezone.now() + timedelta(days=7),
            'status': 'published',
            'total_marks': 50,
            'passing_marks': 20,
            'instructor': instructor
        }
    )
    print(f"✅ Exam 11 prepared: {exam.title} (ID: {exam.id})")

    # 4. Enroll Student
    enrollment, e_created = ExamEnrollment.objects.get_or_create(
        exam=exam,
        student=student,
        defaults={'status': 'enrolled'}
    )
    print(f"✅ Student {student.username} enrolled (Enrollment ID: {enrollment.id})")

    # 5. Ensure Questions exist
    print("Refreshing questions for Exam 11...")
    Question.objects.filter(exam=exam).delete()
    
    # Q1: MCQ
    q1 = Question.objects.create(exam=exam, title="Boolean Algebra", description="Which gate represents the logical NAND operation?", question_type="mcq", marks=10)
    mcq1 = MCQQuestion.objects.create(question=q1)
    MCQOption.objects.create(mcq_question=mcq1, option_text="NOT OR", is_correct=False, order=1)
    MCQOption.objects.create(mcq_question=mcq1, option_text="NOT AND", is_correct=True, order=2)
    MCQOption.objects.create(mcq_question=mcq1, option_text="AND NOT", is_correct=False, order=3)
    
    # Q2: MCQ
    q2 = Question.objects.create(exam=exam, title="K-Maps", description="What is the primary purpose of a Karnaugh Map?", question_type="mcq", marks=10)
    mcq2 = MCQQuestion.objects.create(question=q2)
    MCQOption.objects.create(mcq_question=mcq2, option_text="Memory Storage", is_correct=False, order=1)
    MCQOption.objects.create(mcq_question=mcq2, option_text="Boolean Simplification", is_correct=True, order=2)
    
    # Q3: MCQ
    q3 = Question.objects.create(exam=exam, title="Flip-Flops", description="Which flip-flop is known for its toggle property?", question_type="mcq", marks=10)
    mcq3 = MCQQuestion.objects.create(question=q3)
    MCQOption.objects.create(mcq_question=mcq3, option_text="JK Flip-Flop", is_correct=True, order=1)
    MCQOption.objects.create(mcq_question=mcq3, option_text="D Flip-Flop", is_correct=False, order=2)
    
    # Q4: Coding
    q4 = Question.objects.create(exam=exam, title="Bitwise Logic", description="Write a function to check if a number is a power of two using bitwise operators.", question_type="coding", marks=10)
    CodingQuestion.objects.create(question=q4, programming_language="python", starter_code="def is_power_of_two(n):\n    # Write your code here\n    pass", solution_code="return n > 0 and (n & (n - 1)) == 0")
    
    # Q5: Coding
    q5 = Question.objects.create(exam=exam, title="Register Simulation", description="Implement a simple 8-bit register incrementer.", question_type="coding", marks=10)
    CodingQuestion.objects.create(question=q5, programming_language="python", starter_code="def increment_register(val):\n    # Return lower 8 bits of val + 1\n    pass", solution_code="return (val + 1) & 0xFF")
    
    print("✅ 5 Questions created for Exam 11.")

if __name__ == "__main__":
    finalize_exam_11()
