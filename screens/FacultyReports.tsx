import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { User } from '../types';
import { useAuth } from '../services/authContext';
import { examsAPI } from '../services/apiService';
import { 
  FileText, Search, Filter, Download, ChevronRight, 
  BarChart2, Users, Calendar, AlertTriangle, ShieldCheck,
  Loader2, ExternalLink, Activity
} from 'lucide-react';

interface FacultyReportsProps {
  onNavigate: (path: string) => void;
}

export const FacultyReportsScreen: React.FC<FacultyReportsProps> = ({ onNavigate }) => {
  const { user: authUser } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const facultyUser: User = { 
    id: String(authUser?.id || ''), 
    name: authUser ? `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.username : 'Faculty', 
    email: authUser?.email || '', 
    role: (authUser?.role as any) || 'faculty' 
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await examsAPI.getMyExams();
        setExams(data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.course_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout currentUser={facultyUser} onNavigate={onNavigate} currentPath="/reports">
      <div className="max-w-[1600px] mx-auto pb-12 animate-slide-up px-4 md:px-0">
        
        {/* Header */}
        <div className="relative mb-12 p-10 bg-slate-900 rounded-[2.5rem] overflow-hidden text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                     <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-indigo-400" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-300">Intelligent Archive</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 uppercase italic">Report Center</h1>
                    <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed">
                        Access comprehensive academic performance audits, proctoring violation logs, and historical assessment data.
                    </p>
                </div>
                <div className="flex bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
                    <div className="px-6 py-4 text-center border-r border-white/10">
                        <p className="text-3xl font-black text-white">{exams.length}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Subjects</p>
                    </div>
                    <div className="px-6 py-4 text-center">
                        <p className="text-3xl font-black text-indigo-400">{exams.filter(e => e.status === 'closed').length}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Audited</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
            <div className="relative flex-1 group">
                <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search subjects or examination codes..." 
                    value={searchQuery || ''}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[1.8rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all shadow-sm"
                />
            </div>
            <button className="flex items-center justify-center gap-3 px-10 py-5 bg-white border border-slate-200 rounded-[1.8rem] text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-shadow shadow-sm">
                <Filter className="w-5 h-5 text-indigo-600" /> Filter Archive
            </button>
        </div>

        {/* Reports Grid */}
        {loading ? (
            <div className="py-32 flex flex-col items-center justify-center">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-indigo-400 animate-pulse" />
                    </div>
                </div>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-slate-400">Decrypting Compliance Data...</p>
            </div>
        ) : filteredExams.length === 0 ? (
            <div className="py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-200">
                    <Search className="w-12 h-12 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">Zero Records Identified</h3>
                <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed text-lg text-pretty">No assessment records match your current search parameters. Please expand your query criteria.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredExams.map((exam) => (
                    <div 
                        key={exam.id} 
                        onClick={() => onNavigate(`/exam-analytics?id=${exam.id}`)}
                        className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full"
                    >
                        {/* Status Badge */}
                        <div className="flex justify-between items-start mb-10">
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                exam.status === 'closed' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                                exam.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                'bg-slate-50 text-slate-600 border-slate-100'
                            }`}>
                                {exam.status === 'closed' ? 'Audit Complete' : exam.status === 'active' ? 'Live Monitoring' : 'Draft Protocol'}
                            </span>
                            <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-sm">
                                <ExternalLink className="w-5 h-5" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight">
                            {exam.title}
                        </h3>
                        <p className="text-sm font-bold text-slate-400 mb-10 uppercase tracking-widest">{exam.course_name}</p>

                        <div className="mt-auto space-y-6 pt-8 border-t border-slate-50">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Users className="w-4 h-4" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Enrolled</span>
                                    </div>
                                    <p className="text-sm font-black text-slate-700">{exam.enrolled_count || 0} Students</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Date</span>
                                    </div>
                                    <p className="text-sm font-black text-slate-700">{new Date(exam.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <BarChart2 className="w-4 h-4" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Integrity</span>
                                    </div>
                                    <p className="text-sm font-black text-emerald-600">High Fidelity</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Audited By</span>
                                    </div>
                                    <p className="text-sm font-black text-indigo-600 italic uppercase">SparkLess AI</p>
                                </div>
                            </div>
                        </div>

                        {/* Hover Overlay Visual */}
                        <div className="absolute top-0 left-0 w-1 h-0 bg-indigo-600 group-hover:h-full transition-all duration-500"></div>
                    </div>
                ))}
            </div>
        )}

        {/* Global Security Summary */}
        <div className="mt-20 bg-indigo-950 rounded-[4rem] p-16 text-white flex flex-col md:flex-row items-center gap-12 shadow-2xl shadow-indigo-200 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
             <div className="w-32 h-32 bg-white/5 backdrop-blur-2xl rounded-[3rem] flex items-center justify-center shrink-0 border border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                <ShieldCheck className="w-16 h-16 text-indigo-400" />
            </div>
            <div className="flex-1 text-center md:text-left relative z-10">
                <h4 className="text-3xl font-black mb-4 uppercase tracking-normal">End-to-End Compliance Certification</h4>
                <p className="text-indigo-200/60 font-medium leading-relaxed text-xl max-w-4xl">
                    Every report generated within this archive is verified by the SparkLess Security Protocol. 
                    Includes deep-learning proctoring logs, student browser activity, and biometric verification timestamps.
                </p>
            </div>
            <button className="relative z-10 px-12 py-6 bg-white text-indigo-950 rounded-[1.8rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-2xl shadow-white/5 hover:-translate-y-2 active:scale-95">
                Generate Master Archive
            </button>
        </div>

      </div>
    </DashboardLayout>
  );
};
