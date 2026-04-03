import os
import sys
import django

sys.path.append(os.path.join(os.getcwd(), 'Exam Proactor', 'exam_proctor_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_proctor_backend.settings')
try:
    django.setup()
except Exception:
    pass

from apps.exams.youtube import generate_exam_content

TEST_TRANSCRIPT = """
Welcome to this tutorial on Python lists. Today we will learn how to create lists, access elements using indices, and use list methods like append and pop.
Python lists are ordered, mutable collections of items. You can create a list using square brackets.
For example, my_list = [1, 2, 3]. 
To access the first element, use index 0: my_list[0].
To add an element to the end, use the append method: my_list.append(4).
To remove the last element, use the pop method: my_list.pop().
Is it possible to have different data types in a single list? Yes, absolutely.
"""

def test_generation():
    print("Testing generate_exam_content with Gemini 3.1 Flash Lite...")
    try:
        questions = generate_exam_content(TEST_TRANSCRIPT, difficulty='Intermediate', count=3, include_coding=True)
        print(f"Successfully generated {len(questions)} questions.")
        
        for i, q in enumerate(questions):
            print(f"\nQuestion {i+1} ({q.get('type')}):")
            print(f"Text: {q.get('text')}")
            if q.get('type') == 'mcq':
                print(f"Options: {len(q.get('options', []))}")
                for opt in q.get('options', []):
                    print(f" - {opt.get('text')} [Correct: {opt.get('isCorrect')}]")
            elif q.get('type') == 'coding':
                print(f"Language: {q.get('language')}")
                print(f"Test Cases: {len(q.get('testCases', []))}")
                for tc in q.get('testCases', []):
                    print(f" - In: {tc.get('input')} | Out: {tc.get('output')} [Hidden: {tc.get('isHidden')}]")
                    
    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    test_generation()
