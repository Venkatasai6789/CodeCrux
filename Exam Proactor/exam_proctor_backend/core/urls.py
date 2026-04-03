"""
URL configuration for Exam Proctor Backend project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from rest_framework.views import APIView

class APIRootView(APIView):
    """API Root endpoint with welcome message and endpoint list."""
    
    def get(self, request):
        return Response({
            'message': 'Welcome to Exam Proctor Backend API',
            'version': '1.0',
            'endpoints': {
                'admin': '/admin/',
                'auth': {
                    'token': '/api/auth/token/',
                    'token_refresh': '/api/auth/token/refresh/',
                },
                'users': '/api/users/',
                'exams': '/api/exams/',
                'questions': '/api/questions/',
                'submissions': '/api/submissions/',
                'proctoring': '/api/proctoring/',
            },
            'documentation': '/documentation/',
            'status': 'running'
        })

urlpatterns = [
    # Frontend
    path('', TemplateView.as_view(template_name='index.html'), name='index'),
    path('exams/', TemplateView.as_view(template_name='index.html'), name='exams'),
    path('profile/', TemplateView.as_view(template_name='index.html'), name='profile'),
    
    # API
    path('api/', APIRootView.as_view(), name='api-root'),
    path('admin/', admin.site.urls),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('api/users/', include('exam_proctor_backend.apps.users.urls')),
    path('api/exams/', include('exam_proctor_backend.apps.exams.urls')),
    path('api/questions/', include('exam_proctor_backend.apps.questions.urls')),
    path('api/submissions/', include('exam_proctor_backend.apps.submissions.urls')),
    path('api/proctoring/', include('exam_proctor_backend.apps.proctoring.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
