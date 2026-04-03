
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { User } from '../types';
import { useAuth } from '../services/authContext';
import { examsAPI } from '../services/apiService';
import { 
  TrendingUp, Users, BookOpen, Activity, ChevronDown, Download, 
  Share2, FileText, AlertTriangle, CheckCircle, Search, Filter,
  MoreHorizontal, ArrowUpRight, ArrowDownRight, Zap, Sparkles, Loader2
} from 'lucide-react';

interface FacultyAnalyticsProps {
  onNavigate: (path: string) => void;
}

export const FacultyAnalyticsScreen: React.FC<FacultyAnalyticsProps> = ({ onNavigate }) => {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState('This Semester');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const result = await examsAPI.getFacultyAnalytics();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const facultyUser: User = { 
    id: String(authUser?.id || ''), 
    name: authUser ? `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.username : 'Faculty', 
    email: authUser?.email || '', 
    role: 'faculty' 
  };

  if (loading) {
    return (
      <DashboardLayout currentUser={facultyUser} onNavigate={onNavigate} currentPath="/analytics">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-slate-500 font-medium italic">Crunching the numbers...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  return (
    <DashboardLayout currentUser={facultyUser} onNavigate={onNavigate} currentPath="/analytics">
      <div className="max-w-[1600px] mx-auto pb-24 animate-slide-up space-y-8 px-4 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Teaching Analytics</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium italic">Real-time insights into student performance and proctoring integrity.</p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all min-w-[160px] justify-between">
                        {period} <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                    {/* Dropdown would go here */}
                </div>
                <button className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                    <Sparkles className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                label="Total Students" 
                value={data.overview.totalStudents} 
                icon={Users} 
                color="text-indigo-600" 
                bg="bg-indigo-50"
                trend="+12%"
            />
            <StatCard 
                label="Avg Performance" 
                value={`${data.overview.avgPerformance}%`} 
                icon={TrendingUp} 
                color={data.overview.avgPerformance > 75 ? 'text-emerald-600' : 'text-amber-600'} 
                bg={data.overview.avgPerformance > 75 ? 'bg-emerald-50' : 'bg-amber-50'}
                trend="+4.2%"
            />
            <StatCard 
                label="Course Completion" 
                value={`${data.overview.completionRate}%`} 
                icon={BookOpen} 
                color="text-blue-600" 
                bg="bg-blue-50"
                trend="+8%"
            />
            <StatCard 
                label="Engagement Score" 
                value={`${data.overview.engagementScore}%`} 
                icon={Activity} 
                color="text-indigo-600" 
                bg="bg-indigo-50"
                trend="Stable"
            />
        </div>

        {/* Performance Trend */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110"></div>
            
            <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Class Performance Trend</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Smarter data for smarter teaching</p>
                </div>
                <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-lg bg-indigo-600"></div>
                        <span className="text-slate-500">Average Score</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-1 rounded-full bg-amber-400"></div>
                        <span className="text-slate-500 transition-colors group-hover:text-amber-600">Passing Threshold</span>
                    </div>
                </div>
            </div>
            
            <div className="h-[350px] w-full relative z-10">
                <PerformanceTrendChart data={data.trend} />
            </div>
        </div>

        {/* Student Distribution & Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-between min-h-[500px]">
                <h3 className="text-xl font-bold text-slate-900 self-start mb-8 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                    Grade Distribution
                </h3>
                <GradeDistributionChart data={data.grades} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-6 mt-12 w-full max-w-lg">
                    {data.grades.map((g: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-3.5 h-3.5 rounded-md shadow-sm" style={{ backgroundColor: g.color }}></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{g.label}</span>
                                <span className="text-sm font-black text-slate-800">{g.value}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance Highlights */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col h-full min-h-[500px]">
                <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                    Performance Highlights
                </h3>
                <div className="space-y-6 flex-grow">
                    <HighlightItem 
                        label="Top Performer" 
                        value={data.statsSummary.topPerformer.name} 
                        subValue={data.statsSummary.topPerformer.score}
                        icon={CheckCircle}
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                        description="Exhibiting consistent excellence across all modules."
                    />
                    
                    <div className="flex items-center justify-between p-6 bg-red-50 rounded-2xl border border-red-100 shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-red-50">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-white rounded-xl text-red-600 shadow-sm">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-red-700 uppercase tracking-[0.2em] mb-1">Attention Required</p>
                                <p className="text-2xl font-black text-red-900">{data.statsSummary.strugglingCount} Students at Risk</p>
                                <p className="text-xs text-red-800/60 font-medium mt-1 italic">Declining trend detected in last 2 exams.</p>
                            </div>
                        </div>
                        <button className="px-5 py-2.5 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-100 uppercase tracking-wider">
                            Reach Out
                        </button>
                    </div>

                    <HighlightItem 
                        label="Most Improved" 
                        value={data.statsSummary.mostImproved.name} 
                        subValue={data.statsSummary.mostImproved.score}
                        icon={TrendingUp}
                        color="text-indigo-600"
                        bg="bg-indigo-50"
                        description="Major breakthrough in algorithmic thinking detected."
                    />
                    
                    <HighlightItem 
                        label="Consistent Performers" 
                        value={`${data.statsSummary.consistentCount} Students`} 
                        subValue=">80% Avg"
                        icon={Activity}
                        color="text-blue-600"
                        bg="bg-blue-50"
                        description="These students maintain a steady learning pace."
                    />
                </div>
            </div>
        </div>

        {/* Exam Analytics Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-lg">
            <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Exam Performance Report</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium italic">Deep dive into recent assessments</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                        <Filter className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-100 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                        <tr>
                            <th className="px-8 py-6">Exam Name</th>
                            <th className="px-8 py-6">Date</th>
                            <th className="px-8 py-6">Avg Score</th>
                            <th className="px-8 py-6">Pass Rate</th>
                            <th className="px-8 py-6">High / Low</th>
                            <th className="px-8 py-6">Integrity</th>
                            <th className="px-8 py-6 text-right">Avg Focus</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.exams.map((exam: any) => (
                            <tr key={exam.id} className="group hover:bg-indigo-50/30 transition-all">
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{exam.name}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Exam ID: #{exam.id}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-sm text-slate-500 font-medium">{exam.date}</td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-base font-black ${exam.avg > 80 ? 'text-emerald-600' : 'text-slate-700'}`}>{exam.avg}%</span>
                                        <div className="flex gap-1 items-end h-6">
                                            {[40, 60, 55, 80, 75, 90].map((h, i) => (
                                                <div key={i} className="w-1 bg-slate-100 rounded-full" style={{ height: `${h}%` }}></div>
                                            ))}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-bold text-slate-700">{exam.pass}</span>
                                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: exam.pass }}></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-xs font-black">
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col items-center">
                                            <span className="text-emerald-600 text-sm">{exam.high}</span>
                                            <span className="text-[8px] text-slate-300 uppercase">High</span>
                                        </div>
                                        <div className="w-[1px] h-6 bg-slate-100"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-red-500 text-sm">{exam.low}</span>
                                            <span className="text-[8px] text-slate-300 uppercase">Low</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 font-medium">
                                    {exam.issues > 0 ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-200">
                                            {exam.issues} Issues <AlertTriangle className="w-3 h-3" />
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            Clear <CheckCircle className="w-3 h-3" />
                                        </span>
                                    )}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <span className={`text-lg font-black ${exam.attention < 80 ? 'text-amber-600' : 'text-indigo-600'}`}>
                                        {exam.attention}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Proctoring & AI Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProctoringSummary data={data.proctoring} />
            <AIRecommendationsPanel insights={data.insights || []} />
        </div>

        {/* Export Footer */}
        <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">
                Cloud Analytics Engine v4.2 • Secured with QuantumGuard Proctoring
            </p>
            <div className="flex gap-4">
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest">
                    <Share2 className="w-4 h-4" /> Share
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 rounded-2xl text-xs font-black text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

// --- Sub-Components ---

const StatCard = ({ label, value, icon: Icon, color, bg, trend }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${bg} ${color} shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7" />
            </div>
            <div className="flex flex-col items-end">
                <span className={`text-[10px] font-black uppercase tracking-widest ${trend.includes('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {trend}
                </span>
                <div className={`w-12 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden`}>
                     <div className={`h-full ${trend.includes('+') ? 'bg-emerald-500' : 'bg-slate-300'}`} style={{ width: trend.includes('+') ? '70%' : '100%' }}></div>
                </div>
            </div>
        </div>
        <div className="relative z-10">
            <h3 className={`text-4xl font-black text-slate-900 tracking-tighter`}>{value}</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 italic">{label}</p>
        </div>
        
        {/* Subtle background text */}
        <div className="absolute -bottom-4 -right-2 text-slate-50 font-black text-6xl pointer-events-none select-none opacity-50">
            {label.split(' ')[0]}
        </div>
    </div>
);

const HighlightItem = ({ label, value, subValue, icon: Icon, color, bg, description }: any) => (
    <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-indigo-100 group">
        <div className="flex items-center gap-5">
            <div className={`p-4 bg-white rounded-xl ${color} shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-lg font-black text-slate-900 tracking-tight">{value}</p>
                <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">{description}</p>
            </div>
        </div>
        <div className={`flex flex-col items-end gap-1 font-black ${color}`}>
            <span className={`text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-sm transition-all group-hover:border-indigo-200`}>
                {subValue}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] uppercase tracking-tighter">Details</span>
                <ArrowUpRight className="w-2.5 h-2.5" />
            </div>
        </div>
    </div>
);

const ProctoringSummary = ({ data }: { data: any }) => (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between h-full group">
        <div className="flex justify-between items-center mb-10">
            <div>
                <h3 className="text-xl font-bold text-slate-900">Proctoring & Integrity</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Monitoring academic honesty</p>
            </div>
            <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full uppercase tracking-widest">Global Scan • 30 Days</span>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
            <SummaryWidget label="Sessions" value={data.totalExams} color="blue" />
            <SummaryWidget label="Incidents" value={data.incidents} color="red" />
            <SummaryWidget label="Flagged" value={data.flaggedStudents} color="amber" />
            <SummaryWidget label="Avg Focus" value={`${data.avgAttention}%`} color="emerald" />
        </div>
        
        <button className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
            Open Advanced Integrity Studio
        </button>
    </div>
);

const SummaryWidget = ({ label, value, color }: any) => {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        red: 'bg-red-50 text-red-600 border-red-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    };
    return (
        <div className={`p-6 ${colors[color]} rounded-2xl border transition-all hover:scale-[1.02]`}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">{label}</p>
            <p className="text-3xl font-black">{value}</p>
        </div>
    );
};

const AIRecommendationsPanel = ({ insights }: { insights: any[] }) => (
    <div className="bg-[#1e1b4b] rounded-3xl p-8 shadow-xl shadow-indigo-100 relative overflow-hidden h-full flex flex-col">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <Zap className="w-48 h-48 text-indigo-400 animate-pulse" />
        </div>
        
        <div className="flex items-start gap-5 mb-8 relative z-10">
            <div className="p-4 bg-indigo-500/20 rounded-2xl text-indigo-300 border border-indigo-400/30 shadow-inner">
                <Sparkles className="w-7 h-7" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white tracking-tight">AI Teaching Insights</h3>
                <p className="text-xs text-indigo-300/70 font-medium italic">Neural engine analyzing recent performance clusters...</p>
            </div>
        </div>
        
        <div className="space-y-4 relative z-10 flex-grow">
            {insights.map((insight: any, idx: number) => {
                let Icon = Activity;
                if (insight.type === 'up') Icon = ArrowUpRight;
                if (insight.type === 'down') Icon = ArrowDownRight;
                
                return (
                    <InsightRow 
                        key={idx}
                        icon={Icon} 
                        text={insight.text} 
                        color={insight.type === 'up' ? 'text-emerald-400' : insight.type === 'down' ? 'text-rose-400' : 'text-indigo-400'}
                    />
                );
            })}
        </div>
        
        <button className="w-full mt-8 py-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 group">
            Synthesize New Insights <TrendingUp className="w-3 h-3 group-hover:translate-y-[-2px] transition-transform" />
        </button>
    </div>
);

const InsightRow = ({ icon: Icon, text, color }: any) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm transition-all hover:bg-white/10 hover:translate-x-1 group animate-slide-right" style={{ animationDelay: '200ms' }}>
        <div className={`p-2 rounded-lg bg-white/5 ${color} mt-0.5`}>
            <Icon className="w-4 h-4" />
        </div>
        <p className="text-sm text-indigo-100/90 leading-relaxed font-medium">
            {text}
        </p>
    </div>
);


const PerformanceTrendChart = ({ data }: { data: number[] }) => {
    const height = 350;
    const width = 1000;
    const padding = 40;
    const maxY = 100;

    const points = data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
        const y = height - padding - (d / maxY) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
                <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                </linearGradient>
            </defs>
            
            {/* Grid */}
            {[0, 25, 50, 75, 100].map(val => (
                <line 
                    key={val} 
                    x1={padding} 
                    y1={height - padding - (val/100)*(height-2*padding)} 
                    x2={width - padding} 
                    y2={height - padding - (val/100)*(height-2*padding)} 
                    stroke="#F1F5F9" 
                    strokeWidth="2" 
                />
            ))}

            {/* Threshold line */}
            <line 
                x1={padding} 
                y1={height - padding - 0.6*(height-2*padding)} 
                x2={width - padding} 
                y2={height - padding - 0.6*(height-2*padding)} 
                stroke="#fbbf24" 
                strokeWidth="2" 
                strokeDasharray="8 8" 
                className="opacity-50"
            />

            <path 
                d={`M ${padding},${height-padding} L ${points} L ${width-padding},${height-padding} Z`} 
                fill="url(#trendGradient)" 
                className="animate-fade-in"
            />
            
            <polyline 
                points={points} 
                fill="none" 
                stroke="#4F46E5" 
                strokeWidth="6" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="drop-shadow-lg"
            />
            
            {data.map((d, i) => {
                const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
                const y = height - padding - (d / maxY) * (height - 2 * padding);
                return (
                    <g key={i} className="group/dot">
                        <circle cx={x} cy={y} r="10" fill="white" className="opacity-0 group-hover/dot:opacity-10 transition-opacity cursor-pointer" />
                        <circle cx={x} cy={y} r="5" fill="white" stroke="#4F46E5" strokeWidth="3" className="transition-all group-hover/dot:r-8 cursor-pointer shadow-indigo-50 shadow-sm" />
                    </g>
                );
            })}
        </svg>
    );
};

const GradeDistributionChart = ({ data }: { data: any[] }) => {
    const total = 100;
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="relative w-72 h-72">
            <svg viewBox="-1.2 -1.2 2.4 2.4" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full overflow-visible drop-shadow-2xl">
                {data.map((slice, i) => {
                    const start = cumulativePercent;
                    const end = cumulativePercent + slice.value / total;
                    cumulativePercent = end;

                    const [startX, startY] = getCoordinatesForPercent(start);
                    const [endX, endY] = getCoordinatesForPercent(end);
                    const largeArcFlag = slice.value / total > 0.5 ? 1 : 0;

                    return (
                        <path
                            key={i}
                            d={`M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                            fill={slice.color}
                            className="hover:scale-110 origin-center transition-all duration-500 cursor-pointer stroke-white stroke-[0.02]"
                        />
                    );
                })}
            </svg>
            <div className="absolute inset-0 m-auto w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center shadow-[inset_0_2px_15px_rgba(0,0,0,0.1)] border-8 border-slate-50">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Status</span>
                <span className="text-4xl font-black text-slate-900 tracking-tighter">Graded</span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1 italic">Verified</span>
            </div>
        </div>
    );
};
