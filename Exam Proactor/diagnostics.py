import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_proctor_backend.core.settings')
django.setup()

from exam_proctor_backend.apps.exams.models import Exam
from exam_proctor_backend.apps.questions.models import Question

with open('exam_diagnostics.txt', 'w') as f:
    f.write("--- EXAM DIAGNOSTICS ---\n")
    exams = Exam.objects.all()
    f.write(f"Total Exams: {exams.count()}\n\n")
    for e in exams:
        q_count = Question.objects.filter(exam=e).count()
        f.write(f"ID: {e.id} | Title: {e.title} | Questions: {q_count} | Status: {e.status}\n")
    f.write("\n--- END ---")
