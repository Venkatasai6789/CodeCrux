
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { User, Exam } from '../types';
import { examsAPI } from '../services/apiService';
import { useAuth } from '../services/authContext';
import { 
  Plus, Search, Filter, MoreHorizontal, Calendar, Users, 
  Clock, BarChart, Edit, Copy, Trash2, Eye, PlayCircle, FileText, Loader2,
  Sparkles, ShieldCheck, Activity, ChevronRight
} from 'lucide-react';

interface FacultyExamsProps {
  onNavigate: (path: string) => void;
}

export const FacultyExamsScreen: React.FC<FacultyExamsProps> = ({ onNavigate }) => {
  const { user: authUser } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const user: User = {
    id: String(authUser?.id || '0'),
    name: authUser ? `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.username : 'Professor Smith',
    email: authUser?.email || 'admin@sparkless.com',
    role: 'faculty'
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await examsAPI.getMyExams();
      
      const transformedExams: Exam[] = data.map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        courseName: item.course_name,
        date: item.start_time,
        status: item.status === 'published' ? 'Scheduled' : 
                item.status === 'active' ? 'Live' : 
                item.status === 'closed' ? 'Completed' : 'Draft',
        totalStudents: item.enrolled_count || 0,
        durationMinutes: item.duration_minutes,
        questionCount: item.question_count,
      }));
      
      setExams(transformedExams);
    } catch (err) {
      console.error('Failed to fetch faculty exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout currentUser={user} onNavigate={onNavigate} currentPath="/faculty-exams">
      <div className="max-w-[1600px] mx-auto pb-12 animate-slide-up px-4 md:px-0">
        
        {/* Header Section with Glassmorphism */}
        <div className="relative mb-12 p-8 md:p-12 bg-indigo-900 rounded-[2.5rem] overflow-hidden text-white shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-indigo-300" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-300">Assessment Intelligent</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Exam Management</h1>
                    <p className="text-indigo-200/80 max-w-xl font-medium text-lg leading-relaxed">
                        Orchestrate secure, high-integrity evaluations. Design AI-augmented assessments and monitor student performance in real-time.
                    </p>
                </div>
                <button 
                    onClick={() => onNavigate('/faculty-exams/create')}
                    className="group flex items-center gap-3 bg-white text-indigo-900 px-8 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl hover:-translate-y-1 active:scale-95"
                >
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    Ignite Smart Exam
                </button>
            </div>
        </div>

        {/* Dynamic Controls Bar */}
        <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
            <div className="relative flex-1 w-full group">
                <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Filter records by examination title or course domain..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[1.8rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all shadow-sm placeholder:text-slate-400"
                />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-5 bg-white border border-slate-200 rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                    <Filter className="w-5 h-5 text-indigo-600" />
                    Status
                </button>
                <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-5 bg-white border border-slate-200 rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Archive
                </button>
            </div>
        </div>

        {/* Assessment Matrix */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                    </div>
                </div>
                <p className="mt-6 text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Synchronizing Assessment Data...</p>
            </div>
        ) : filteredExams.length === 0 ? (
            <div className="p-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/50 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-200 transition-transform group-hover:scale-105 duration-500">
                    <FileText className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">Zero Records Found</h3>
                <p className="text-slate-500 font-medium max-w-md mx-auto mb-10 leading-relaxed text-lg">No examinations have been identified. Initialize your academic repository by creating your first smart assessment.</p>
                <button 
                    onClick={() => onNavigate('/faculty-exams/create')}
                    className="bg-slate-950 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-100 hover:-translate-y-1"
                >
                    Initialize First Exam
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6">
                {filteredExams.map((exam) => (
                    <div key={exam.id} className="group relative bg-white border border-slate-100 rounded-[2.2rem] p-8 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 flex flex-col xl:flex-row xl:items-center justify-between gap-8 cursor-default">
                        
                        {/* Exam Identity */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-3 h-3 rounded-full ${
                                    exam.status === 'Live' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse' :
                                    exam.status === 'Scheduled' ? 'bg-amber-500' :
                                    exam.status === 'Completed' ? 'bg-indigo-500' : 'bg-slate-300'
                                }`}></div>
                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border
                                    ${exam.status === 'Live' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                      exam.status === 'Draft' ? 'bg-slate-50 text-slate-600 border-slate-100' : 
                                      exam.status === 'Completed' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                      'bg-amber-50 text-amber-700 border-amber-100'}
                                `}>
                                    {exam.status}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID: {exam.id}</span>
                            </div>
                            
                            <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{exam.title}</h3>
                            
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <div className="p-2.5 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                                        <Activity className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Domain</span>
                                        <span className="text-sm font-bold text-slate-700">{exam.courseName}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 border-l border-slate-100 pl-6">
                                    <div className="p-2.5 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                                        <Calendar className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Date</span>
                                        <span className="text-sm font-bold text-slate-700">{typeof exam.date === 'string' ? new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date(exam.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 border-l border-slate-100 pl-6">
                                    <div className="p-2.5 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                                        <Users className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Assigned</span>
                                        <span className="text-sm font-bold text-slate-700">{exam.totalStudents} Students</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 border-l border-slate-100 pl-6">
                                    <div className="p-2.5 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                                        <Clock className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Questions</span>
                                        <span className="text-sm font-bold text-slate-700">{exam.questionCount} Items</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Actions Bridge */}
                        <div className="flex flex-row xl:flex-col items-center gap-4 shrink-0 pt-8 xl:pt-0 border-t xl:border-t-0 xl:border-l border-slate-100 xl:pl-10">
                            {exam.status === 'Live' && (
                                <button 
                                    onClick={() => onNavigate('/live-monitoring')}
                                    className="flex-1 xl:w-full flex items-center justify-center gap-4 px-10 py-5 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 transition-all hover:-translate-y-1 active:scale-95"
                                >
                                    <PlayCircle className="w-5 h-5" /> Live Monitor
                                </button>
                            )}
                            
                            {exam.status === 'Draft' && (
                                <button className="flex-1 xl:w-full flex items-center justify-center gap-4 px-10 py-5 rounded-[1.5rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-1">
                                    <Edit className="w-5 h-5" /> Continue Setup
                                </button>
                            )}

                            {(exam.status === 'Scheduled' || exam.status === 'Completed') && (
                                <button 
                                    onClick={() => exam.status === 'Completed' ? onNavigate(`/exam-analytics?id=${exam.id}`) : onNavigate(`/exam-details?id=${exam.id}`)}
                                    className={`flex-1 xl:w-full flex items-center justify-center gap-4 px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all hover:-translate-y-1 ${
                                        exam.status === 'Completed' 
                                            ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100' 
                                            : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}
                                >
                                    {exam.status === 'Completed' ? <BarChart className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    {exam.status === 'Completed' ? 'Performance' : 'View Assets'}
                                </button>
                            )}

                            <div className="flex gap-3">
                                <button className="p-5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-[1.2rem] transition-all border border-transparent hover:border-indigo-100 shadow-sm md:shadow-none">
                                    <MoreHorizontal className="w-6 h-6" />
                                </button>
                                <button className="p-5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-[1.2rem] transition-all border border-transparent hover:border-red-100 shadow-sm md:shadow-none">
                                    <Trash2 className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Global Security Summary */}
        <div className="mt-16 bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm flex flex-col md:flex-row items-center gap-10">
            <div className="w-24 h-24 bg-indigo-900 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl shadow-indigo-200">
                <ShieldCheck className="w-12 h-12 text-indigo-300" />
            </div>
            <div className="flex-1 text-center md:text-left">
                <h4 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">Academic Integrity Engine</h4>
                <p className="text-slate-500 font-medium leading-relaxed text-lg max-w-4xl">
                    All assessments are encrypted and monitored by the SparkLess Security Protocol. 
                    Monitor student eye-tracking, environment stability, and suspicious behavior patterns via the <span className="text-indigo-600 font-bold hover:underline cursor-pointer">Live Monitoring Command Center</span>.
                </p>
            </div>
            <button className="flex items-center gap-3 font-black text-xs uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors group">
                Review Protocols <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
        </div>

      </div>
    </DashboardLayout>
  );
};