
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { XPWidget } from '../components/Dashboard/XPWidget';
import { ChevronRight, Loader2, Calendar, ClipboardCheck, Zap, ArrowRight, ShieldCheck, Clock, FileText } from 'lucide-react';
import { User, Exam } from '../types';
import { useAuth } from '../services/authContext';
import { examsAPI } from '../services/apiService';

interface DashboardProps {
  onNavigate: (path: string) => void;
}

export const DashboardScreen: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user: authUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Real data from API
  const [exams, setExams] = useState<Exam[]>([]);
  const [nextExam, setNextExam] = useState<Exam | null>(null);

  // Map auth user to the User type the layout expects
  const user: User = {
    id: String(authUser?.id || ''),
    name: authUser ? `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.username : 'Student',
    email: authUser?.email || '',
    role: 'student',
  };

  const [stats, setStats] = useState({
    completedExams: 0,
    averageScore: 0
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch upcoming exams
        const examStats = await examsAPI.getDashboardStats();
        const upcomingExams = (examStats?.upcoming_exams || []).map((ex: any) => ({
          id: String(ex.id),
          title: ex.title,
          courseName: ex.course_name,
          date: new Date(ex.start_time),
          durationMinutes: ex.duration_minutes,
          questionCount: ex.question_count || 0,
          status: 'Scheduled' as const,
        }));
        setExams(upcomingExams);
        setStats({
          completedExams: examStats?.completed_exams || 0,
          averageScore: examStats?.average_score || 0
        });

        // Set next exam (closest to now)
        if (upcomingExams.length > 0) {
          const sorted = [...upcomingExams].sort((a, b) => 
            (a.date instanceof Date ? a.date.getTime() : 0) - (b.date instanceof Date ? b.date.getTime() : 0)
          );
          setNextExam(sorted[0]);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout currentUser={user} onNavigate={onNavigate}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Preparing your assessment portal...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentUser={user} onNavigate={onNavigate}>
      <div className="animate-slide-up pb-24">

        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    Welcome back, {user.name.split(' ')[0]} <span className="animate-wave text-3xl">👋</span>
                </h1>
                <p className="text-slate-500 text-sm max-w-xl leading-relaxed flex items-center gap-2">
                    Account Status: <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100"><ShieldCheck className="w-3.5 h-3.5" /> Verified for Testing</span>
                </p>
            </div>
            <div className="hidden md:block">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 text-right">System Time</span>
                <span className="text-sm font-bold text-slate-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
            </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

            {/* Left Column (Main Content) */}
            <div className="xl:col-span-8 space-y-8">

                {/* Next Scheduled Exam (Hero) */}
                <section>
                    {nextExam ? (
                        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-700"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl group-hover:bg-purple-500/20 transition-colors duration-700"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
                                        <Zap className="w-3 h-3 fill-emerald-400" /> Next Scheduled Test
                                    </div>
                                    <div className="text-slate-400 text-xs font-medium">Starts in {Math.round((nextExam.date instanceof Date ? nextExam.date.getTime() - Date.now() : 0) / (1000 * 60 * 60))} hours</div>
                                </div>

                                <h2 className="text-4xl font-bold mb-4 tracking-tight drop-shadow-sm">{nextExam.title}</h2>
                                <p className="text-indigo-200/80 mb-8 max-w-lg leading-relaxed text-lg">
                                    Course: <span className="text-white font-semibold">{nextExam.courseName}</span> • Duration: <span className="text-white font-semibold">{nextExam.durationMinutes} Minutes</span>
                                </p>

                                <div className="flex flex-wrap items-center gap-4">
                                    <button 
                                        onClick={() => onNavigate(`/proctoring-test?examId=${nextExam.id}`)}
                                        className="bg-white text-slate-900 font-bold px-8 py-3.5 rounded-2xl flex items-center gap-2 hover:bg-indigo-50 transition-all active:scale-95 shadow-lg shadow-white/10"
                                    >
                                        Start System Check <ArrowRight className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => onNavigate('/exams')}
                                        className="bg-white/10 border border-white/20 text-white font-bold px-8 py-3.5 rounded-2xl backdrop-blur-md hover:bg-white/20 transition-all active:scale-95"
                                    >
                                        Exam Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rotate-45 translate-x-1/2 -translate-y-1/2"></div>
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                <ClipboardCheck className="w-10 h-10 text-slate-300" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2 relative">No Scheduled Tests</h2>
                            <p className="text-slate-500 max-w-sm mx-auto mb-8 relative">
                                You don't have any exams scheduled at the moment. Keep an eye on your notifications for new assessments.
                            </p>
                            <button 
                                onClick={() => onNavigate('/exams')}
                                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all relative shadow-lg shadow-indigo-600/20"
                            >
                                View All Exams <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </section>

                {/* Detailed Exam Schedule */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Upcoming Schedule</h2>
                            <p className="text-sm text-slate-500">Your upcoming test sessions and deadlines</p>
                        </div>
                        <button 
                            onClick={() => onNavigate('/exams')}
                            className="bg-slate-100 text-slate-600 font-bold p-2.5 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        >
                            <Calendar className="w-5 h-5" />
                        </button>
                    </div>

                    {exams.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {exams.map(exam => (
                                <div key={exam.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-slate-50 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wider">{exam.courseName}</div>
                                        <div className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">{new Date(exam.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors line-clamp-1 text-lg">{exam.title}</h3>
                                    
                                    <div className="flex items-center justify-between text-xs text-slate-500 mb-6 font-medium bg-slate-50/50 p-2.5 rounded-xl">
                                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {exam.durationMinutes} min</span>
                                        <span className="flex items-center gap-1.5 font-bold text-slate-400">|</span>
                                        <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {exam.questionCount} Questions</span>
                                    </div>

                                    <button 
                                        onClick={() => onNavigate('/exams')}
                                        className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-sm group-hover:bg-indigo-600 transition-all shadow-md active:scale-95"
                                    >
                                        View Instructions
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                            <p className="text-slate-400 font-medium">No further results found for your profile.</p>
                        </div>
                    )}
                </section>
            </div>

            {/* Right Column (Widgets) - MINIMAL VERSION */}
            <div className="xl:col-span-4 space-y-6">

                {/* Profile Performance Widget */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 p-[3px] shadow-lg shadow-indigo-100 mb-4 group-hover:scale-105 transition-transform">
                             <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-white flex items-center justify-center">
                                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=6366f1,a855f7&fontSize=40&fontWeight=700`} alt="Profile" className="w-full h-full object-cover" />
                             </div>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{user.name}</h3>
                        <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100 mb-6">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{authUser?.department || 'Assessment Center'}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 w-full pt-4 border-t border-slate-100">
                             <div className="text-center border-r border-slate-100">
                                 <span className="block text-xl font-bold text-slate-900">{stats.completedExams}</span>
                                 <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Tests Taken</span>
                             </div>
                             <div className="text-center">
                                 <span className="block text-xl font-bold text-indigo-600">{stats.averageScore > 0 ? `${stats.averageScore}%` : '--%'}</span>
                                 <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Avg. Score</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* System Integrity Widget */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2.5 rounded-2xl shadow-sm">
                            <ShieldCheck className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm tracking-tight">System Integrity</h4>
                            <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Secured & Verified
                            </p>
                        </div>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">Your hardware sensors and network latency are optimal for proctored environments.</p>
                </div>

                {/* XP Widget */}
                <XPWidget />
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};