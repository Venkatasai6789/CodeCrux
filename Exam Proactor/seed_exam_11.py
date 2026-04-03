"""
Seed script: Specifically for Exam 11 content restoration.
Run with: py seed_exam_11.py
"""
import os
import sys
import django
from datetime import timedelta
from django.utils import timezone

# ── setup django ─────────────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_proctor_backend.core.settings')
django.setup()

from django.contrib.auth import get_user_model
from exam_proctor_backend.apps.exams.models import Course, Exam, ExamEnrollment
from exam_proctor_backend.apps.questions.models import Question, MCQQuestion, MCQOption, CodingQuestion, TestCase

User = get_user_model()

def create_mcq(exam, title, description, options, marks=10, difficulty='medium'):
    q = Question.objects.create(
        exam=exam, question_type='mcq', title=title, 
        description=description, marks=marks, difficulty=difficulty
    )
    mcq = MCQQuestion.objects.create(question=q)
    for i, opt in enumerate(options):
        MCQOption.objects.create(
            mcq_question=mcq,
            option_text=opt['text'],
            is_correct=opt.get('is_correct', False),
            order=i
        )
    return q

def create_coding(exam, title, description, starter_code, solution_code, test_cases, language='python', marks=30, difficulty='hard'):
    q = Question.objects.create(
        exam=exam, question_type='coding', title=title,
        description=description, marks=marks, difficulty=difficulty
    )
    coding = CodingQuestion.objects.create(
        question=q, programming_language=language,
        starter_code=starter_code, solution_code=solution_code
    )
    for i, tc in enumerate(test_cases):
        TestCase.objects.create(
            coding_question=coding,
            input_data=tc['input'],
            expected_output=tc['output'],
            is_visible=tc.get('visible', True),
            order=i
        )
    return q

def seed_exam_11():
    print("🚀 Seeding Exam 11: Digital Logic & Processor Design")
    
    # 1. Identify admin/instructor user
    instructor = User.objects.filter(role='instructor').first()
    if not instructor:
        instructor = User.objects.create_superuser('admin11', 'admin11@example.com', 'admin123')
    
    # 2. Identify/Create Course
    course, _ = Course.objects.get_or_create(
        title='EE342: Deep Logic Design',
        instructor=instructor,
        defaults={'description': 'Advanced course on digital logic, processor architecture, and FPGA design.'}
    )
    
    # 3. Create/Update Exam 11
    now = timezone.now()
    exam, created = Exam.objects.get_or_create(
        id=11,
        defaults={
            'title': 'Digital Logic & Processor Design Final',
            'description': 'Final assessment covering sequential logic, pipelining, and MIPS architecture.',
            'instructor': instructor,
            'course': course,
            'start_time': now - timedelta(hours=1),
            'end_time': now + timedelta(days=7),
            'duration_minutes': 120,
            'status': 'published',
            'total_marks': 100,
            'passing_marks': 40
        }
    )
    
    if not created:
        exam.status = 'published'
        exam.start_time = now - timedelta(hours=1)
        exam.end_time = now + timedelta(days=7)
        exam.save()

    # Clear old questions
    Question.objects.filter(exam=exam).delete()
    
    # 4. MCQ Questions
    create_mcq(exam, "Sequential Logic", "What is the primary difference between a flip-flop and a latch?", [
        {'text': 'Latency', 'is_correct': False},
        {'text': 'Edge-triggering vs Level-triggering', 'is_correct': True},
        {'text': 'Voltage levels', 'is_correct': False},
        {'text': 'Number of input gates', 'is_correct': False},
    ])
    
    create_mcq(exam, "Memory Segments", "In a MIPS architecture, where is the program counter (PC) usually stored?", [
        {'text': 'General Purpose Register', 'is_correct': False},
        {'text': 'Stack pointer', 'is_correct': False},
        {'text': 'Instruction Register', 'is_correct': False},
        {'text': 'Dedicated PC Register', 'is_correct': True},
    ])

    create_mcq(exam, "MIPS ISA", "Which MIPS instruction format is used for branch instructions?", [
        {'text': 'R-format', 'is_correct': False},
        {'text': 'I-format', 'is_correct': True},
        {'text': 'J-format', 'is_correct': False},
        {'text': 'S-format', 'is_correct': False},
    ])

    # 5. Coding Questions
    create_coding(exam, "Binary Conversion", "Write a Python function `to_binary(n)` that returns the binary representation of a positive integer as a string.",
        "def to_binary(n):\n    # Your code here\n    pass",
        "def to_binary(n):\n    return bin(n)[2:]",
        [{'input': '10', 'output': '1010'}, {'input': '5', 'output': '101'}]
    )

    create_coding(exam, "Logic Gate Simulator", "Write a function `logic_and(a, b)` that returns the logic AND of two input bits.",
        "def logic_and(a, b):\n    # Your logic here\n    pass",
        "def logic_and(a, b):\n    return 1 if a == 1 and b == 1 else 0",
        [{'input': '1, 1', 'output': '1'}, {'input': '1, 0', 'output': '0'}]
    )

    # 6. Ensure student enrollment for the test URL
    # manual_1775171831446 -> this is a string enrollmentId, we need to handle it.
    # In my LiveExam.tsx, I had `const numericEnrollId = parseInt(enrollmentId, 10);`
    # Let me add a valid student to this exam.
    student = User.objects.filter(role='student').first()
    if student:
        ExamEnrollment.objects.get_or_create(
            student=student,
            exam=exam,
            defaults={'status': 'enrolled'}
        )

    print("✅ Exam 11 seeded successfully with 5 questions.")

if __name__ == "__main__":
    seed_exam_11()
