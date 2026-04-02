
import React, { useState, useEffect } from 'react';
import { LoginScreen } from './screens/Login';
import { RegisterScreen } from './screens/Register';
import { DashboardScreen } from './screens/Dashboard';
import { MyCoursesScreen } from './screens/MyCourses';
import { CourseLearningScreen } from './screens/CourseLearning';
import { QuizScreen } from './screens/Quiz';
import { PracticeLabScreen } from './screens/PracticeLab';
import { ProctoringScreen } from './screens/Proctoring';
import { ExamResultsScreen } from './screens/ExamResults';
import { AnalyticsScreen } from './screens/Analytics';
import { LiveExamScreen } from './screens/LiveExam';
import { ExamsScreen } from './screens/Exams';
import { FacultyDashboardScreen } from './screens/FacultyDashboard';
import { FacultyExamCreateScreen } from './screens/FacultyExamCreate';
import { FacultyExamsScreen } from './screens/FacultyExams';
import { LiveMonitoringScreen } from './screens/LiveMonitoring';
import { ExamAnalyticsScreen } from './screens/ExamAnalytics';
import { StudentManagementScreen } from './screens/StudentManagement';
import { FacultyProctoringSettingsScreen } from './screens/FacultyProctoringSettings';
import { FacultyDisputesScreen } from './screens/FacultyDisputes';
import { FacultyAnalyticsScreen } from './screens/FacultyAnalytics';
import { SettingsScreen } from './screens/Settings';
import { HelpCenterScreen } from './screens/HelpCenter';
import { FacultyCoursesScreen } from './screens/FacultyCourses';
import { FacultyReportsScreen } from './screens/FacultyReports';

const App: React.FC = () => {
  // Using simple state-based routing since we can't use React Router DOM in this environment easily
  // In a real app, use react-router-dom
  const [currentPath, setCurrentPath] = useState<string>('/login');

  // Handle hash changes for simple navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/login';
      setCurrentPath(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
  };

  return (
    <div className="font-sans antialiased text-slate-900 bg-white min-h-screen">
      {currentPath === '/register' ? (
        <RegisterScreen onNavigate={navigate} />
      ) : currentPath === '/dashboard' ? (
        <DashboardScreen onNavigate={navigate} />
      ) : currentPath === '/faculty-dashboard' ? (
        <FacultyDashboardScreen onNavigate={navigate} />
      ) : currentPath === '/faculty-exams' ? (
        <FacultyExamsScreen onNavigate={navigate} />
      ) : currentPath === '/faculty-exams/create' ? (
        <FacultyExamCreateScreen onNavigate={navigate} />
      ) : currentPath === '/faculty-settings' ? (
        <FacultyProctoringSettingsScreen onNavigate={navigate} />
      ) : currentPath === '/faculty-disputes' ? (
        <FacultyDisputesScreen onNavigate={navigate} />
      ) : currentPath === '/faculty-analytics' ? (
        <FacultyAnalyticsScreen onNavigate={navigate} />
      ) : currentPath === '/faculty-courses' ? (
        <FacultyCoursesScreen onNavigate={navigate} />
      ) : currentPath === '/reports' ? (
        <FacultyReportsScreen onNavigate={navigate} />
      ) : currentPath === '/live-monitoring' ? (
        <LiveMonitoringScreen onNavigate={navigate} />
      ) : currentPath === '/exam-analytics' ? (
        <ExamAnalyticsScreen onNavigate={navigate} />
      ) : currentPath === '/students' ? (
        <StudentManagementScreen onNavigate={navigate} />
      ) : currentPath === '/courses' ? (
        <MyCoursesScreen onNavigate={navigate} />
      ) : currentPath === '/exams' ? (
        <ExamsScreen onNavigate={navigate} />
      ) : currentPath === '/analytics' ? (
        <AnalyticsScreen onNavigate={navigate} />
      ) : currentPath === '/settings' ? (
        <SettingsScreen onNavigate={navigate} />
      ) : currentPath === '/help' ? (
        <HelpCenterScreen onNavigate={navigate} />
      ) : currentPath.startsWith('/learning') ? (
        <CourseLearningScreen onNavigate={navigate} />
      ) : currentPath === '/quiz' ? (
        <QuizScreen onNavigate={navigate} />
      ) : currentPath === '/lab' ? (
        <PracticeLabScreen onNavigate={navigate} />
      ) : currentPath === '/proctoring' ? (
        <ProctoringScreen onNavigate={navigate} />
      ) : currentPath === '/live-exam' ? (
        <LiveExamScreen onNavigate={navigate} />
      ) : currentPath === '/exam-results' ? (
        <ExamResultsScreen onNavigate={navigate} />
      ) : (
        <LoginScreen onNavigate={navigate} />
      )}
    </div>
  );
};

export default App;
