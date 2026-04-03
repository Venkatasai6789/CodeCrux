import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { ExamCard } from '../components/Dashboard/ExamCard';
import { User, Exam } from '../types';
import { Search, Filter, Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { examsAPI, authAPI } from '../services/apiService';

interface ExamsScreenProps {
  onNavigate: (path: string) => void;
}

export const ExamsScreen: React.FC<ExamsScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // User Data
  const user = authAPI.getUser() || {
    id: '0',
    name: 'Student',
    email: 'student@example.com',
  };

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        // Get exams specifically for this student
        const data = await examsAPI.getMyExams();
        
        // Transform backend data to frontend Exam type
        const transformedExams: Exam[] = data.map((item: any) => ({
          id: item.id.toString(),
          title: item.title,
          date: item.start_time,
          durationMinutes: item.duration_minutes,
          status: item.status === 'completed' ? 'Completed' : 'Scheduled', // Simple logic for list view
          courseName: item.course_name,
          enrollmentId: item.enrollment_id?.toString(),
          questionCount: item.question_count,
        }));
        
        setExams(transformedExams);
      } catch (err: any) {
        console.error('Failed to fetch exams:', err);
        setError(err.message || 'Failed to load examinations');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const displayedExams = exams.filter(e => 
    activeTab === 'upcoming' ? e.status === 'Scheduled' : e.status === 'Completed'
  );

  return (
    <DashboardLayout currentUser={user} onNavigate={onNavigate} currentPath="/exams">
      <div className="animate-slide-up pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Examinations</h1>
                <p className="text-slate-500 text-sm max-w-xl">
                    View upcoming assessments, check your eligibility, and review past performance.
                </p>
            </div>
            
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button 
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'upcoming' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'}`}
                >
                    Upcoming
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'}`}
                >
                    History
                </button>
            </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search exams..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
            </div>
            <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                    <Calendar className="w-4 h-4" />
                    Date
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                    <Filter className="w-4 h-4" />
                    Filter
                </button>
            </div>
        </div>

        {/* Exams Grid */}
        {loading ? (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-500 text-sm">Fetching your examinations...</p>
            </div>
        ) : error ? (
            <div className="text-center py-20 bg-red-50 rounded-2xl border border-dashed border-red-200">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-red-900 mb-1">Failed to load exams</h3>
                <p className="text-red-600 text-sm">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                >
                  Retry
                </button>
            </div>
        ) : displayedExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedExams.map(exam => (
                    <div key={exam.id} className="transform hover:-translate-y-1 transition-transform duration-300">
                        <ExamCard exam={exam} />
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Clock className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No exams found</h3>
                <p className="text-slate-500 text-sm">Check back later for new assessments.</p>
            </div>
        )}

        {/* Info Banner */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-full shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-blue-900 mb-1">Proctoring Guidelines</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                    All exams are monitored via AI proctoring. Ensure you have a working webcam, microphone, and stable internet connection before starting.
                    ID verification is required for all certification exams.
                </p>
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
};