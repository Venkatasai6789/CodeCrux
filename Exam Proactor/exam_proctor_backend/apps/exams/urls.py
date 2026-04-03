from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamViewSet, ExamEnrollmentViewSet, CourseViewSet

router = DefaultRouter()
router.register(r'exams', ExamViewSet, basename='exam')
router.register(r'enrollments', ExamEnrollmentViewSet, basename='enrollment')
router.register(r'courses', CourseViewSet, basename='course')

urlpatterns = [
    path('', include(router.urls)),
]
