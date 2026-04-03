
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { ExamCard } from '../components/Dashboard/ExamCard';
import { User, Exam } from '../types';
import { Search, Filter, Calendar, Clock, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { examsAPI, authAPI } from '../services/apiService';
import { useAuth } from '../services/authContext';

interface ExamsScreenProps {
  onNavigate: (path: string) => void;
}

export const ExamsScreen: React.FC<ExamsScreenProps> = ({ onNavigate }) => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const user: User = {
    id: String(authUser?.id || '0'),
    name: authUser ? `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.username : 'Student',
    email: authUser?.email || '',
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await examsAPI.getMyExams();
      
      const transformedExams: Exam[] = data.map((item: any) => {
        // Determine status based on dates and enrollment status
        const now = new Date();
        const startTime = new Date(item.start_time);
        const endTime = new Date(item.end_time);
        
        let displayStatus: 'Scheduled' | 'Completed' | 'Live' = 'Scheduled';
        
        // 1. Time-based default status
        if (now > endTime) {
            displayStatus = 'Completed';
        } else if (now >= startTime && now <= endTime) {
            displayStatus = 'Live';
        }
        
        // 2. Override with actual enrollment status from backend
        // 'enrolled', 'started', 'submitted', 'completed'
        if (item.enrollment_status === 'submitted' || item.enrollment_status === 'completed') {
            displayStatus = 'Completed';
        } else if (item.enrollment_status === 'started' && now <= endTime) {
            displayStatus = 'Live';
        }
        
        return {
          id: item.id.toString(),
          title: item.title,
          description: item.description,
          date: item.start_time,
          durationMinutes: item.duration_minutes,
          status: displayStatus,
          courseName: item.course_name,
          enrollmentId: item.enrollment_id?.toString(),
          questionCount: item.question_count,
        };
      });
      
      setExams(transformedExams);
    } catch (err: any) {
      console.error('Failed to fetch exams:', err);
      setError(err.message || 'Failed to connect to the examination server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const filteredExams = exams.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         e.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'upcoming') {
        return matchesSearch && e.status !== 'Completed';
    } else {
        return matchesSearch && e.status === 'Completed';
    }
  });

  return (
    <DashboardLayout currentUser={user} onNavigate={onNavigate} currentPath="/exams">
      <div className="animate-slide-up pb-12 max-w-[1600px] mx-auto px-4 md:px-0">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assessment Portal</h1>
                </div>
                <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" /> Manage your upcoming tests and review your examination history.
                </p>
            </div>
            
            <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <button 
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === 'upcoming' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                >
                    Upcoming
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === 'history' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                >
                    History
                </button>
            </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by exam title or course..." 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all shadow-sm"
                />
            </div>
            <div className="flex gap-3">
                <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm uppercase tracking-wider">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Date
                </button>
                <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm uppercase tracking-wider">
                    <Filter className="w-5 h-5 text-indigo-500" />
                    Filter
                </button>
            </div>
        </div>

        {/* Content Section */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                    </div>
                </div>
                <p className="mt-6 text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Accessing Secure Records...</p>
            </div>
        ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 bg-red-50 rounded-[2.5rem] border border-red-100 text-center px-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-red-100">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-red-900 mb-2 uppercase tracking-tight">Access Denied</h3>
                <p className="text-red-600 font-medium max-w-md mx-auto mb-8">{error}</p>
                <button 
                  onClick={fetchExams}
                  className="px-8 py-4 bg-white text-red-600 border-2 border-red-100 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-lg"
                >
                  Retry Authentication
                </button>
            </div>
        ) : filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredExams.map(exam => (
                    <div key={exam.id} className="group">
                        <ExamCard exam={exam} />
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-32 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                    <Clock className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-400 mb-2 uppercase tracking-widest">No Records Found</h3>
                <p className="text-slate-400 font-medium">There are no examinations matching your current criteria.</p>
            </div>
        )}

        {/* Proctoring Warning */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 to-indigo-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/20">
                    <ShieldCheckIcon className="w-10 h-10 text-indigo-300" />
                </div>
                <div className="text-center md:text-left">
                    <h4 className="text-2xl font-black mb-3 uppercase tracking-tight">AI Integrated Proctoring</h4>
                    <p className="text-slate-300 font-medium leading-relaxed max-w-3xl">
                        To maintain assessment integrity, all sessions are monitored using real-time anti-cheat algorithms. 
                        Ensure your <span className="text-white font-bold">Camera</span>, <span className="text-white font-bold">Microphone</span>, and <span className="text-white font-bold">Full-Screen Mode</span> are operational before ignition.
                    </p>
                </div>
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

const ShieldCheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);