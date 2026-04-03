"""
Cleanup Script: Remove all student exam attempt data.

PRESERVES: Course, Exam, Question, MCQQuestion, MCQOption, CodingQuestion, TestCase, User
DELETES:   ExamEnrollment (cascades to violations, sessions, submissions, activity logs, screen captures)
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
base_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, base_dir)
sys.path.insert(0, os.path.join(base_dir, 'exam_proctor_backend'))
django.setup()

from exam_proctor_backend.apps.proctoring.models import ProctoringViolation, ExamSession, ActivityLog, ScreenCapture
from exam_proctor_backend.apps.submissions.models import QuestionSubmission, MCQSubmission, CodingSubmission, CodingTestCaseResult
from exam_proctor_backend.apps.exams.models import ExamEnrollment

print("=" * 60)
print("  STUDENT ATTEMPT DATA CLEANUP")
print("=" * 60)

# Count before deletion
counts = {
    "ExamEnrollment": ExamEnrollment.objects.count(),
    "ProctoringViolation": ProctoringViolation.objects.count(),
    "ExamSession": ExamSession.objects.count(),
    "ActivityLog": ActivityLog.objects.count(),
    "ScreenCapture": ScreenCapture.objects.count(),
    "QuestionSubmission": QuestionSubmission.objects.count(),
    "MCQSubmission": MCQSubmission.objects.count(),
    "CodingSubmission": CodingSubmission.objects.count(),
    "CodingTestCaseResult": CodingTestCaseResult.objects.count(),
}

print("\n--- Records BEFORE cleanup ---")
for model, count in counts.items():
    print(f"  {model:30s}: {count}")

total = sum(counts.values())
if total == 0:
    print("\n  No student attempt data found. Database is already clean.")
    sys.exit(0)

# Delete in dependency order (children first, then parent)
print("\n--- Deleting student attempt data ---")

d1 = CodingTestCaseResult.objects.all().delete()
print(f"  CodingTestCaseResult  : {d1[0]} deleted")

d2 = CodingSubmission.objects.all().delete()
print(f"  CodingSubmission      : {d2[0]} deleted")

d3 = MCQSubmission.objects.all().delete()
print(f"  MCQSubmission         : {d3[0]} deleted")

d4 = QuestionSubmission.objects.all().delete()
print(f"  QuestionSubmission    : {d4[0]} deleted")

d5 = ScreenCapture.objects.all().delete()
print(f"  ScreenCapture         : {d5[0]} deleted")

d6 = ActivityLog.objects.all().delete()
print(f"  ActivityLog           : {d6[0]} deleted")

d7 = ExamSession.objects.all().delete()
print(f"  ExamSession           : {d7[0]} deleted")

d8 = ProctoringViolation.objects.all().delete()
print(f"  ProctoringViolation   : {d8[0]} deleted")

d9 = ExamEnrollment.objects.all().delete()
print(f"  ExamEnrollment        : {d9[0]} deleted")

# Verify preserved data
from exam_proctor_backend.apps.exams.models import Course, Exam
from exam_proctor_backend.apps.questions.models import Question, MCQQuestion, MCQOption, CodingQuestion, TestCase

print("\n--- PRESERVED data (untouched) ---")
print(f"  Course         : {Course.objects.count()}")
print(f"  Exam           : {Exam.objects.count()}")
print(f"  Question       : {Question.objects.count()}")
print(f"  MCQQuestion    : {MCQQuestion.objects.count()}")
print(f"  MCQOption      : {MCQOption.objects.count()}")
print(f"  CodingQuestion : {CodingQuestion.objects.count()}")
print(f"  TestCase       : {TestCase.objects.count()}")

print("\n" + "=" * 60)
print("  CLEANUP COMPLETE - All student attempts removed.")
print("  Courses, exams, questions, and test cases are intact.")
print("=" * 60)
