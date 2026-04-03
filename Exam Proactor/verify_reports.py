import os
import django
import json
import sys
from django.utils import timezone

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.join(os.getcwd(), 'exam_proctor_backend'))
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from exam_proctor_backend.apps.exams.views import ExamViewSet
from django.contrib.auth import get_user_model

User = get_user_model()

def verify_report_data(exam_id):
    print(f"🧐 Verifying Report Data for Exam ID: {exam_id}")
    
    factory = APIRequestFactory()
    user = User.objects.get(username='faculty_tester')
    
    view = ExamViewSet.as_view({'get': 'results_detail'})
    request = factory.get(f'/api/exams/exams/{exam_id}/results_detail/')
    force_authenticate(request, user=user)
    
    response = view(request, pk=exam_id)
    
    if response.status_code != 200:
        print(f"❌ Error: Received status {response.status_code}")
        print(response.data)
        return

    data = response.data
    print(f"✅ API Response Status: {response.status_code}")
    print(f"📋 Summary: {data['summary']['total_students']} students, {data['summary']['total_violations']} total violations")

    for student in data['students']:
        print(f"\n👤 Student: {student['name']} ({student['status']})")
        
        if student['has_session'] and 'session' in student:
            session = student['session']
            print(f"   📊 Session Status: {session['status']}")
            print(f"   🛡️ Violations: {len(session['violations'])}")
            print(f"   📈 Activities: {len(session['activities'])}")
            
            # Check for absolute URLs in violations
            for v in session['violations']:
                if 'evidence_screenshot' in v and v['evidence_screenshot']:
                    is_absolute = v['evidence_screenshot'].startswith('http')
                    print(f"      📸 Violation Screenshot: {v['evidence_screenshot']} (Absolute: {is_absolute})")
                else:
                    print(f"      📸 Violation Screenshot: None")
                    
            if len(session['violations']) == 0 and student['violations_count'] > 0:
                print(f"   ❌ FAILURE: Violations missing in session data!")
        else:
            print(f"   🚫 No session data available")

if __name__ == '__main__':
    verify_report_data(29)
