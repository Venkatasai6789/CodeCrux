"""
Freesh seed: Clears all current courses, exams, and questions.
Creates new courses, exams (with duration), and dynamic questions/options.
Run with: py seed_new.py
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
    print("🗑️  Cleaning database...")
    # Delete courses, exams, and questions. 
    # Cascading deletes will handle MCQQuestion, CodingQuestion, MCQOption, TestCase, ExamEnrollment.
    # We'll keep users but we'll re-enroll them.
    Course.objects.all().delete()
    Exam.objects.all().delete()
    Question.objects.all().delete()
    
    instructor = User.objects.filter(role='instructor').first()
    if not instructor:
        print("Creating admin instructor...")
        instructor = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        instructor.role = 'instructor'
        instructor.save()
        
    student = User.objects.filter(role='student').first()
    if not student:
        print("Creating student user...")
        student = User.objects.create_user('student', 'student@example.com', 'student123')
        student.role = 'student'
        student.save()

    now = timezone.now()

    # 📚 Course 1: Full Stack Web Development
    print("📚 Creating Course 1: Full Stack Web Development")
    course_fs = Course.objects.create(
        title='Full Stack Web Development',
        description='Learn everything from HTML/CSS to React, Node.js, and SQL/NoSQL databases.',
        instructor=instructor,
        category='coding',
        difficulty='intermediate',
        total_lessons=25
    )
    
    # 📝 Exam 1: React & Frontend Dynamics
    print("📝 Creating Exam 1: React & Frontend Dynamics")
    exam_react = Exam.objects.create(
        title='React & Frontend Dynamics',
        description='Test your knowledge of hooks, components, state management, and props.',
        course_name='Full Stack Web Development',
        instructor=instructor,
        course=course_fs,
        start_time=now - timedelta(hours=1),
        end_time=now + timedelta(days=7),
        duration_minutes=60,
        status='published',
        total_marks=50,
        passing_marks=20
    )
    
    create_mcq(exam_react, "React Hooks", "Which hook is used for side effects in a functional component?", [
        {'text': 'useState', 'is_correct': False},
        {'text': 'useContext', 'is_correct': False},
        {'text': 'useEffect', 'is_correct': True},
        {'text': 'useReducer', 'is_correct': False},
    ])
    
    create_mcq(exam_react, "State Management", "Which of the following is NOT a React state management library?", [
        {'text': 'Redux', 'is_correct': False},
        {'text': 'Zustand', 'is_correct': False},
        {'text': 'MobX', 'is_correct': False},
        {'text': 'Express', 'is_correct': True},
    ])

    create_mcq(exam_react, "Virtual DOM", "What is the primary benefit of the Virtual DOM?", [
        {'text': 'Directly modifies the actual DOM', 'is_correct': False},
        {'text': 'Faster updates by only reconciling differences', 'is_correct': True},
        {'text': 'Eliminates the need for HTML', 'is_correct': False},
        {'text': 'Provides a visual editor for UI', 'is_correct': False},
    ])

    # 📚 Course 2: Advanced Data Structures
    print("📚 Creating Course 2: Advanced Data Structures")
    course_dsa = Course.objects.create(
        title='Advanced Data Structures & Algorithms',
        description='Deep dive into hash tables, heaps, graphs, and dynamic programming.',
        instructor=instructor,
        category='coding',
        difficulty='advanced',
        total_lessons=30
    )
    
    # 📝 Exam 2: Graph Theory Final
    print("📝 Creating Exam 2: Graph Theory Final")
    exam_graph = Exam.objects.create(
        title='Graph Theory & Algorithms Final',
        description='Covering BFS, DFS, Dijkstra, and Bellman-Ford algorithms.',
        course_name='Advanced Data Structures',
        instructor=instructor,
        course=course_dsa,
        start_time=now,
        end_time=now + timedelta(days=1),
        duration_minutes=90,
        status='published',
        total_marks=70,
        passing_marks=30
    )
    
    create_mcq(exam_graph, "Graph Traversal", "In which traversal is a stack used (conceptually)?", [
        {'text': 'Breadth First Search (BFS)', 'is_correct': False},
        {'text': 'Depth First Search (DFS)', 'is_correct': True},
        {'text': 'Level Order Traversal', 'is_correct': False},
        {'text': 'None of the above', 'is_correct': False},
    ])

    create_coding(exam_graph, "Shortest Path BFS", "Implement a simple BFS to find the distance of nodes from root.",
        "def bfs_distance(graph, root):\n    # Your code here\n    pass",
        "def bfs_distance(graph, root):\n    dist = {root: 0}\n    queue = [root]\n    while queue:\n        u = queue.pop(0)\n        for v in graph[u]:\n            if v not in dist:\n                dist[v] = dist[u] + 1\n                queue.append(v)\n    return dist",
        [{'input': '{"A": ["B", "C"], "B": ["D"], "C": [], "D": []}, "A"', 'output': '{"A": 0, "B": 1, "C": 1, "D": 2}'}]
    )

    # 📚 Course 3: Machine Learning Essentials
    print("📚 Creating Course 3: Machine Learning Essentials")
    course_ml = Course.objects.create(
        title='Machine Learning Essentials',
        description='Introduction to supervised and unsupervised learning, regression, and classification.',
        instructor=instructor,
        category='science',
        difficulty='intermediate',
        total_lessons=20
    )

    # 📝 Exam 3: ML Fundamentals Quiz
    print("📝 Creating Exam 3: ML Fundamentals Quiz")
    exam_ml = Exam.objects.create(
        title='Machine Learning Fundamentals Quiz',
        description='Short quiz on key concepts like bias, variance, and overfitting.',
        course_name='Machine Learning Essentials',
        instructor=instructor,
        course=course_ml,
        start_time=now - timedelta(hours=2),
        end_time=now + timedelta(hours=22),
        duration_minutes=45,
        status='published',
        total_marks=20,
        passing_marks=10
    )

    create_mcq(exam_ml, "Overfitting", "Which of the following is a symptom of overfitting?", [
        {'text': 'High bias, low variance', 'is_correct': False},
        {'text': 'Low bias, high variance (Excellent training, poor test performance)', 'is_correct': True},
        {'text': 'Low performance on both training and test data', 'is_correct': False},
        {'text': 'Balanced bias and variance', 'is_correct': False},
    ])

    # 🎓 Enrollment
    all_exams = [exam_react, exam_graph, exam_ml]
    all_students = User.objects.filter(role='student')
    all_courses = [course_fs, course_dsa, course_ml]

    print(f"🎓 Enrolling {all_students.count()} students in exams and courses...")
    for s in all_students:
        for c in all_courses:
            CourseEnrollment.objects.get_or_create(student=s, course=c, defaults={'completed_lessons': 5})
        for e in all_exams:
            ExamEnrollment.objects.get_or_create(student=s, exam=e, defaults={'status': 'enrolled'})

    print("\n✅ New seed data successfully created with fresh titles, questions, and durations.")

if __name__ == "__main__":
    main()
