
import os
import django
import sys
from django.utils import timezone
from datetime import timedelta

# Add the project root to sys.path
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_proctor_backend.core.settings')
django.setup()

from exam_proctor_backend.apps.exams.models import Exam, ExamEnrollment, Course
from exam_proctor_backend.apps.questions.models import Question, MCQQuestion, MCQOption, CodingQuestion, TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

def seed_exams():
    try:
        instructor = User.objects.get(username='pardhu')
        students = User.objects.filter(username__in=['pavan', 'yogessh', 'hitesh', 'venkat'])
        
        # Create AI/ML Course
        ai_course, _ = Course.objects.get_or_create(
            title='AI & Machine Learning',
            instructor=instructor,
            defaults={'category': 'science', 'difficulty': 'advanced'}
        )
        
        # 1. Neural Networks & Deep Learning Quiz
        exam1, created = Exam.objects.get_or_create(
            title='Neural Networks & Deep Learning Quiz',
            instructor=instructor,
            defaults={
                'course': ai_course,
                'course_name': 'AI & Machine Learning',
                'description': 'A comprehensive assessment on neural architectures, backpropagation, and deep learning optimization techniques.',
                'start_time': timezone.now() - timedelta(hours=1),
                'end_time': timezone.now() + timedelta(days=7),
                'duration_minutes': 45,
                'status': 'published',
                'total_marks': 50,
                'passing_marks': 20
            }
        )
        
        if created:
            # Add MCQ
            q1 = Question.objects.create(
                exam=exam1, question_type='mcq', title='Backpropagation Logic',
                description='What is the primary purpose of backpropagation in a neural network?',
                marks=10, order=1
            )
            mcq1 = MCQQuestion.objects.create(question=q1)
            MCQOption.objects.create(mcq_question=mcq1, option_text='Weight Initialization', is_correct=False)
            MCQOption.objects.create(mcq_question=mcq1, option_text='Gradient Descent Optimization', is_correct=True)
            MCQOption.objects.create(mcq_question=mcq1, option_text='Data Augmentation', is_correct=False)

        # 2. Full Stack Mastery Final
        web_course, _ = Course.objects.get_or_create(
            title='Modern Web Architecture',
            instructor=instructor,
            defaults={'category': 'coding', 'difficulty': 'advanced'}
        )
        
        exam2, created = Exam.objects.get_or_create(
            title='Full Stack Mastery Final',
            instructor=instructor,
            defaults={
                'course': web_course,
                'course_name': 'Modern Web Architecture',
                'description': 'Final examination for the Full Stack Engineering path. Validates knowledge on React, Node.js, and Distributed Systems.',
                'start_time': timezone.now() - timedelta(hours=2),
                'end_time': timezone.now() + timedelta(days=10),
                'duration_minutes': 120,
                'status': 'published',
                'total_marks': 100,
                'passing_marks': 40
            }
        )
        
        if created:
            # Add Coding Question
            q2 = Question.objects.create(
                exam=exam2, question_type='coding', title='Array Sum Function',
                description='Write a function called sumArray that takes an array of integers and returns their sum.',
                marks=50, order=1
            )
            coding2 = CodingQuestion.objects.create(
                question=q2, programming_language='javascript',
                starter_code='function sumArray(arr) {\n  // your code here\n}',
                solution_code='function sumArray(arr) { return arr.reduce((a, b) => a + b, 0); }'
            )
            TestCase.objects.create(coding_question=coding2, input_data='[1, 2, 3]', expected_output='6')
            TestCase.objects.create(coding_question=coding2, input_data='[-1, 1]', expected_output='0')

        # Enroll students
        for student in students:
            ExamEnrollment.objects.get_or_create(exam=exam1, student=student)
            ExamEnrollment.objects.get_or_create(exam=exam2, student=student)
            
        print("Exams seeded successfully.")
    except User.DoesNotExist:
        print("Instructor 'pardhu' or students not found. Run user seed first.")
    except Exception as e:
        print(f"Error seeding: {e}")

if __name__ == '__main__':
    seed_exams()
