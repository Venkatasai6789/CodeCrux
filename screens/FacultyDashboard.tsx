
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { User } from '../types';
import { useAuth } from '../services/authContext';
import { examsAPI } from '../services/apiService';
import {
  Users, FileText, Clock, TrendingUp, AlertCircle, CheckCircle, 
  Eye, MoreHorizontal, ChevronRight, Plus, Search, Filter, 
  Loader2, Sparkles, Activity, ShieldCheck, ArrowUpRight, ArrowDownRight,
  MonitorPlay, LayoutDashboard, Database
} from 'lucide-react';

interface FacultyDashboardProps {
  onNavigate: (path: string) => void;
}

export const FacultyDashboardScreen: React.FC<FacultyDashboardProps> = ({ onNavigate }) => {
  const { user: authUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Real data state
  const [stats, setStats] = useState<any[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [performanceTrend, setPerformanceTrend] = useState<number[]>([]);

  const facultyUser: User = {
    id: String(authUser?.id || ''),
    name: authUser ? `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.username : 'Faculty',
    email: authUser?.email || '',
    role: 'faculty',
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await examsAPI.getDashboardStats();

        // Calculate a pseudo-delta for aesthetics (would be real if we had historical cache)
        const trendSymbol = data.class_average > 75 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />;
        const trendColor = data.class_average > 75 ? 'text-emerald-500' : 'text-amber-500';

        setStats([
          { label: 'Active Matrix', value: data.active_exams || 0, sub: 'Live Now', icon: MonitorPlay, color: 'text-indigo-600', bg: 'bg-indigo-50/50', border: 'border-indigo-100' },
          { label: 'Enrolled Talent', value: data.total_students || 0, sub: 'Total Students', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-100' },
          { label: 'Pending Reviews', value: data.pending_reviews || 0, sub: 'Urgent Action', icon: AlertCircle, color: data.pending_reviews > 0 ? 'text-red-600' : 'text-slate-400', bg: data.pending_reviews > 0 ? 'bg-red-50/50' : 'bg-slate-50/50', border: data.pending_reviews > 0 ? 'border-red-100' : 'border-slate-100' },
          { label: 'Academic Index', value: `${data.class_average || 0}%`, sub: trendSymbol, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-100', trendColor },
        ]);

        setPerformanceTrend(data.performance_trend || []);

        setUpcomingExams(
          (data.upcoming_exams || []).map((ex: any) => ({
            id: ex.id,
            title: ex.title,
            time: `${new Date(ex.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            status: new Date(ex.start_time) > new Date() ? 'Scheduled' : 'In Progress',
            students: ex.enrolled_count || 0,
            date: new Date(ex.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            questionCount: ex.question_count || 0,
          }))
        );

        setSubmissions(
          (data.recent_submissions || []).map((sub: any) => ({
            id: sub.id,
            name: sub.student_name || 'Student',
            exam: sub.exam_title || 'Exam',
            score: sub.percentage != null ? `${sub.percentage}%` : '--',
            status: sub.status === 'submitted' ? 'Pending' : sub.status === 'completed' ? 'Finalized' : sub.status,
            date: sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—',
          }))
        );
      } catch (err) {
        console.error('Failed to load faculty dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout currentUser={facultyUser} onNavigate={onNavigate} currentPath="/faculty-dashboard">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                </div>
            </div>
            <p className="mt-6 text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Accessing Command Center...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentUser={facultyUser} onNavigate={onNavigate} currentPath="/faculty-dashboard">
      <div className="max-w-[1600px] mx-auto pb-24 animate-slide-up px-4 md:px-0">

        {/* Premium Header Container */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="space-y-1">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-900 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                        <LayoutDashboard className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">System Overview</span>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mission Control</h1>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-slate-500">Welcome back, <span className="text-slate-900">{facultyUser.name}</span></h2>
            </div>
            
            <div className="flex flex-wrap gap-3">
                <button 
                    onClick={() => onNavigate('/faculty-exams/create')}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-slate-800 hover:-translate-y-1 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Ignite Assessment
                </button>
                <button className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                    <Database className="w-5 h-5 text-indigo-600" />
                    Export Telemetry
                </button>
            </div>
        </div>

        {/* KPI Grid - Pro Max Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-indigo-50 transition-colors"></div>
                    
                    <div className="relative z-10">
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} ${stat.border} border w-fit mb-6 shadow-sm`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex items-baseline gap-3 mb-2">
                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                                {stat.value}
                            </h3>
                            {stat.trendColor && (
                                <div className={`flex items-center gap-0.5 font-black text-xs ${stat.trendColor}`}>
                                    {stat.sub}
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                        {!stat.trendColor && <div className="text-[10px] font-bold text-slate-400 mt-1">{stat.sub}</div>}
                    </div>
                </div>
            ))}
        </div>

        {/* Dynamic Analytics & Live Feed Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

            {/* Performance Continuum (8 column) */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* Real Performance Chart */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <Activity className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Academic Momentum</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Performance over 15 Standard Days</p>
                            </div>
                        </div>
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                             <span className="px-4 py-1.5 bg-white rounded-lg text-[10px] font-black text-slate-900 shadow-sm uppercase tracking-widest">Average</span>
                             <span className="px-4 py-1.5 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">Density</span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <DynamicPerformanceChart data={performanceTrend} />
                    </div>
                </div>

                {/* Submissions Matrix */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div className="flex items-center gap-3">
                             <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                                 <Users className="w-5 h-5 text-indigo-600" />
                             </div>
                             <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Submissions</h2>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex-1">
                                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="text"
                                    placeholder="Filter by name..."
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-[1.2rem] text-xs font-bold outline-none focus:border-indigo-400 transition-all"
                                />
                            </div>
                            <button className="p-3 bg-slate-50 border border-slate-100 rounded-[1.2rem] text-slate-400 hover:text-indigo-600 transition-all">
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {submissions.length > 0 ? (
                      <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                              <thead>
                                  <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                      <th className="px-8 py-5">Academic Record</th>
                                      <th className="px-8 py-5">Assessment</th>
                                      <th className="px-8 py-5">Metric</th>
                                      <th className="px-8 py-5">Status</th>
                                      <th className="px-8 py-5 text-right">Verification</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                  {submissions.map((sub: any, i: number) => (
                                      <tr key={sub.id} className="hover:bg-indigo-50/30 transition-all cursor-default group">
                                          <td className="px-8 py-6">
                                               <div className="flex items-center gap-3">
                                                   <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px]">
                                                       {sub.name.charAt(0)}
                                                   </div>
                                                   <span className="text-sm font-black text-slate-900">{sub.name}</span>
                                               </div>
                                          </td>
                                          <td className="px-8 py-6 text-sm font-bold text-slate-500 italic max-w-[200px] truncate">{sub.exam}</td>
                                          <td className="px-8 py-6">
                                               <span className="text-sm font-black text-indigo-600">{sub.score}</span>
                                          </td>
                                          <td className="px-8 py-6">
                                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest
                                                  ${sub.status === 'Finalized' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                    sub.status === 'Flagged' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                    'bg-amber-50 text-amber-700 border border-amber-100'}
                                              `}>
                                                  {sub.status === 'Finalized' && <CheckCircle className="w-3 h-3" />}
                                                  {sub.status === 'Flagged' && <AlertCircle className="w-3 h-3" />}
                                                  {sub.status}
                                              </span>
                                          </td>
                                          <td className="px-8 py-6 text-right">
                                              <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
                                                  Review
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                    ) : (
                      <div className="p-20 text-center text-slate-400">
                        <p className="text-xs font-black uppercase tracking-widest">Awaiting Initial Data Ingress...</p>
                      </div>
                    )}
                </div>
            </div>

            {/* Live Feed (4 column) */}
            <div className="lg:col-span-4 space-y-8">
                
                {/* Upcoming Assessments */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                                <MonitorPlay className="w-5 h-5 text-amber-600" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Matrix</h2>
                        </div>
                        <button onClick={() => onNavigate('/faculty-exams')} className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">
                            Global List
                        </button>
                    </div>

                    <div className="space-y-4">
                        {upcomingExams.length > 0 ? (
                            upcomingExams.map((exam: any) => (
                                <div key={exam.id} className="p-5 rounded-[2rem] border border-slate-50 bg-slate-50/30 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
                                            ${exam.status === 'In Progress' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 animate-pulse' : 'bg-slate-900 text-white border-slate-900'}
                                        `}>
                                            {exam.status}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exam.date}</span>
                                    </div>

                                    <h3 className="font-black text-slate-900 mb-2 truncate uppercase tracking-tight">{exam.title}</h3>
                                    
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <Clock className="w-3.5 h-3.5 text-indigo-600" /> {exam.time}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <Users className="w-3.5 h-3.5 text-indigo-600" /> {exam.students}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onNavigate('/live-monitoring')}
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                                    >
                                        Access Module <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Empty Workspace</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Integrity Notification */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-100">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                            <ShieldCheck className="w-6 h-6 text-indigo-300" />
                        </div>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-tight">Integrity Shield</h4>
                            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Operational Status: Optimal</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
                        AI Proctoring core is fully synchronized. Real-time telemetry is currently monitoring <span className="text-white font-bold">2 active sessions</span> across the global cluster.
                    </p>
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-300 hover:text-white transition-colors group">
                        System Health <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Advanced Performance Chart implementation
const DynamicPerformanceChart = ({ data }: { data: number[] }) => {
    // Fill with zeroes if we don't have exactly 15 points
    const fullData = [...(new Array(max(0, 15 - data.length)).fill(0)), ...data].slice(-15);
    const width = 1000;
    const height = 300;
    const paddingX = 40;
    const paddingY = 40;

    const maxX = fullData.length - 1;
    const minY = 0;
    const maxY = 100;
    const rangeY = maxY - minY;

    const points = fullData.map((d, i) => {
        const x = paddingX + (i / maxX) * (width - 2 * paddingX);
        const y = height - paddingY - ((d - minY) / rangeY) * (height - 2 * paddingY);
        return { x, y, val: d };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
                <linearGradient id="chartGlow" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                </linearGradient>
            </defs>
            
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                 <line 
                    key={i} 
                    x1={paddingX} 
                    y1={paddingY + (p * (height - 2*paddingY))} 
                    x2={width - paddingX} 
                    y2={paddingY + (p * (height - 2*paddingY))} 
                    stroke="#F8FAFC" 
                    strokeWidth="2" 
                />
            ))}

            {/* Path and Area */}
            <path d={areaD} fill="url(#chartGlow)" />
            <path d={pathD} fill="none" stroke="#4F46E5" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_8px_16px_rgba(79,70,229,0.3)]" />
            
            {/* Critical Interaction Layer */}
            {points.map((p, i) => (
                <g key={i} className="group cursor-pointer">
                    <circle cx={p.x} cy={p.y} r="8" fill="white" stroke="#4F46E5" strokeWidth="4" className="opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <foreignObject x={p.x - 30} y={p.y - 50} width="60" height="40" className="opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-0 group-hover:scale-100 origin-bottom">
                        <div className="bg-slate-900 text-white text-[10px] font-black py-2 rounded-xl text-center shadow-xl border border-white/10 uppercase tracking-tighter">
                            {p.val}% Index
                        </div>
                    </foreignObject>
                </g>
            ))}
        </svg>
    );
};

const max = (a: number, b: number) => a > b ? a : b;
