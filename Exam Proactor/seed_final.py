"""
Final Seed Script: 
1. Clears ALL Users, Courses, Exams, and Questions.
2. Creates specific users: 
   - Instructor: Pardhu (Admin/Faculty)
   - Students: pavan, yogessh, hitesh, venkat
3. Populates database with fresh courses, exams, and matching enrollments.
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
from exam_proctor_backend.apps.exams.models import Course, Exam, ExamEnrollment, CourseEnrollment
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

def main():
    print("🧹 Wiping all existing data (Users, Courses, Exams, etc.)...")
    # We delete in order to respect constraints if any, though cascades help.
    User.objects.all().delete()
    Course.objects.all().delete()
    Exam.objects.all().delete()
    Question.objects.all().delete()

    print("\n👤 Creating Users...")
    
    pardhu = User.objects.create_user(
        username='pardhu', 
        email='pardhu@codecrux.com', 
        password='password123',
        first_name='Pardhu',
        last_name='S.',
    )
    pardhu.role = 'instructor'
    pardhu.department = 'Computer Science'
    pardhu.is_staff = True
    pardhu.is_superuser = True
    pardhu.save()
    print(f"✅ Created Instructor: {pardhu.username} (Password: password123)")

    # 2. Students
    student_names = ['pavan', 'yogessh', 'hitesh', 'venkat']
    students = []
    for name in student_names:
        s = User.objects.create_user(
            username=name,
            email=f'{name}@codecrux.com',
            password='password123',
            first_name=name.capitalize(),
            last_name='Student',
        )
        s.role = 'student'
        s.department = 'Engineering'
        s.save()
        students.append(s)
        print(f"✅ Created Student: {s.username} (Password: password123)")

    print("\n📚 Creating Course Content...")
    now = timezone.now()

    # 📘 Course: Modern Web Architecture
    course_web = Course.objects.create(
        title='Modern Web Architecture',
        description='Building scalable applications using React, Node.js, and Distributed Systems.',
        instructor=pardhu,
        category='coding',
        difficulty='intermediate',
        total_lessons=30
    )

    # 📝 Exam: Full Stack Mastery Final
    exam_web = Exam.objects.create(
        title='Full Stack Mastery Final',
        description='Comprehensive exam covering frontend performance and backend scalability.',
        course_name='Modern Web Architecture',
        instructor=pardhu,
        course=course_web,
        start_time=now - timedelta(hours=1),
        end_time=now + timedelta(days=5),
        duration_minutes=120,
        status='published',
        total_marks=100,
        passing_marks=40
    )

    create_mcq(exam_web, "React Performance", "Which optimization technique prevents unnecessary re-renders of child components?", [
        {'text': 'useMemo', 'is_correct': False},
        {'text': 'React.memo', 'is_correct': True},
        {'text': 'useCallback', 'is_correct': False},
        {'text': 'All of the above', 'is_correct': False},
    ])

    create_coding(exam_web, "Simple Data Transform", "Create a function that takes a list of objects and returns a map keyed by ID.",
        "def transform(list_data):\n    # Your logic here\n    pass",
        "def transform(list_data):\n    return {str(item['id']): item for item in list_data}",
        [{'input': "[{'id': 1, 'name': 'A'}, {'id': 2, 'name': 'B'}]", 'output': "{'1': {'id': 1, 'name': 'A'}, '2': {'id': 2, 'name': 'B'}}"}],
        marks=40
    )

    # 📗 Course: AI & Machine Learning
    course_ai = Course.objects.create(
        title='AI & Machine Learning Foundations',
        description='Understanding neural networks, natural language processing, and robotics.',
        instructor=pardhu,
        category='science',
        difficulty='advanced',
        total_lessons=40
    )

    # 📝 Exam: Neural Networks Quiz
    exam_ai = Exam.objects.create(
        title='Neural Networks & Deep Learning Quiz',
        description='Testing concepts of backpropagation and activation functions.',
        course_name='AI & Machine Learning',
        instructor=pardhu,
        course=course_ai,
        start_time=now,
        end_time=now + timedelta(days=2),
        duration_minutes=45,
        status='published',
        total_marks=50,
        passing_marks=20
    )

    create_mcq(exam_ai, "Activation Functions", "Which activation function is most commonly used in the hidden layers of a deep neural network?", [
        {'text': 'Sigmoid', 'is_correct': False},
        {'text': 'Tanh', 'is_correct': False},
        {'text': 'ReLU', 'is_correct': True},
        {'text': 'Softmax', 'is_correct': False},
    ])

    print("\n🎓 Enrolling all students...")
    exams = [exam_web, exam_ai]
    courses = [course_web, course_ai]

    for s in students:
        for c in courses:
            CourseEnrollment.objects.create(student=s, course=c, completed_lessons=8)
        for e in exams:
            ExamEnrollment.objects.create(student=s, exam=e, status='enrolled')

    print("\n✨ Database successfully reset and seeded with your specific users and dynamic content!")
    print(f"👉 Login at: http://localhost:3000/#/login")
    print(f"👉 Instructor: pardhu / password123")
    print(f"👉 Students: pavan, yogessh, hitesh, venkat / password123")

if __name__ == "__main__":
    main()
