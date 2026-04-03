
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './services/authContext';
import { LoginScreen } from './screens/Login';
import { RegisterScreen } from './screens/Register';
import { DashboardScreen } from './screens/Dashboard';
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
import { FacultyReportsScreen } from './screens/FacultyReports';
import { ProctoringTestScreen } from './screens/ProctoringTest';

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('/login');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/login';
      setCurrentPath(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // After auth loads, redirect appropriately
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && (currentPath === '/login' || currentPath === '/register')) {
        // Already logged in, redirect to appropriate dashboard
        if (user?.role === 'instructor' || user?.role === 'admin') {
          navigate('/faculty-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else if (!isAuthenticated && currentPath !== '/login' && currentPath !== '/register') {
        navigate('/login');
      }
    }
  }, [isLoading, isAuthenticated]);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Public routes
  if (!isAuthenticated) {
    if (currentPath === '/register') {
      return <RegisterScreen onNavigate={navigate} />;
    }
    return <LoginScreen onNavigate={navigate} />;
  }

  // Protected routes
  return (
    <div className="font-sans antialiased text-slate-900 bg-white min-h-screen">
      {currentPath === '/dashboard' ? (
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
      ) : currentPath === '/reports' ? (
        <FacultyReportsScreen onNavigate={navigate} />
      ) : currentPath === '/live-monitoring' ? (
        <LiveMonitoringScreen onNavigate={navigate} />
      ) : currentPath === '/exam-analytics' ? (
        <ExamAnalyticsScreen onNavigate={navigate} />
      ) : currentPath === '/students' ? (
        <StudentManagementScreen onNavigate={navigate} />
      ) : currentPath === '/exams' ? (
        <ExamsScreen onNavigate={navigate} />
      ) : currentPath === '/analytics' ? (
        <AnalyticsScreen onNavigate={navigate} />
      ) : currentPath === '/settings' ? (
        <SettingsScreen onNavigate={navigate} />
      ) : currentPath === '/help' ? (
        <HelpCenterScreen onNavigate={navigate} />
      ) : currentPath === '/quiz' ? (
        <QuizScreen onNavigate={navigate} />
      ) : currentPath === '/lab' ? (
        <PracticeLabScreen onNavigate={navigate} />
      ) : currentPath.startsWith('/proctoring') ? (
        <ProctoringScreen onNavigate={navigate} />
      ) : currentPath.startsWith('/live-exam') ? (
        <LiveExamScreen onNavigate={navigate} />
      ) : currentPath === '/exam-results' ? (
        <ExamResultsScreen onNavigate={navigate} />
      ) : currentPath === '/proctoring-test' ? (
        <ProctoringTestScreen onNavigate={navigate} />
      ) : (
        // Default: redirect based on role
        user?.role === 'instructor' || user?.role === 'admin' ? (
          <FacultyDashboardScreen onNavigate={navigate} />
        ) : (
          <DashboardScreen onNavigate={navigate} />
        )
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
