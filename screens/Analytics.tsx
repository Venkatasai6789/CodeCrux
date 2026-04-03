
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { User } from '../types';
import { 
  TrendingUp, Clock, Calendar, Award, Target, 
  ArrowUp, ArrowDown, Download, Filter, MoreHorizontal,
  ChevronDown, Zap, BarChart2, Activity, PieChart, CheckCircle,
  FileText, ShieldCheck, Timer, Brain, LayoutDashboard, Search, Loader2
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { examsAPI } from '../services/apiService';

interface AnalyticsScreenProps {
  onNavigate: (path: string) => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ onNavigate }) => {
  const { user: authUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'Week' | 'Month' | 'Year'>('Month');
  const [activeChartTab, setActiveChartTab] = useState<'scores' | 'accuracy' | 'speed'>('scores');

  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const data = await examsAPI.getDetailedAnalytics();
        setAnalyticsData(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const user: User = {
    id: String(authUser?.id || '1'),
    name: authUser ? `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.username : 'Student',
    email: authUser?.email || '',
  };

  if (isLoading || !analyticsData) {
      return (
          <DashboardLayout currentUser={user} onNavigate={onNavigate} currentPath="/analytics">
              <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="text-center space-y-4">
                      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synthesizing Intelligence...</p>
                  </div>
              </div>
          </DashboardLayout>
      );
  }

  return (
    <DashboardLayout currentUser={user} onNavigate={onNavigate} currentPath="/analytics">
      <div className="animate-slide-up pb-16 space-y-8 max-w-[1600px] mx-auto px-4 md:px-0">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assessment Intelligence</h1>
             </div>
             <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" /> Advanced data processing of your mock test performance and accuracy trends.
             </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                {(['Week', 'Month', 'Year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-5 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${
                      timeRange === range 
                        ? 'bg-slate-900 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {range}
                  </button>
                ))}
             </div>
             
             <button className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 rounded-2xl shadow-sm transition-all hover:shadow-md">
                <Download className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Real Dynamic KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <MetricCard 
                label="Mock Tests" 
                value={`${analyticsData.kpi.tests} Tests`} 
                trend="+2" 
                trendLabel="vs last week"
                trendUp={true}
                icon={FileText}
                color="text-indigo-600"
                bg="bg-indigo-50"
                borderColor="border-indigo-100"
            />
            <MetricCard 
                label="Total Questions" 
                value={analyticsData.kpi.questions} 
                trend="+12%" 
                trendLabel="solved"
                trendUp={true}
                icon={Target}
                color="text-orange-600"
                bg="bg-orange-50"
                borderColor="border-orange-100"
            />
            <MetricCard 
                label="Average Score" 
                value={`${analyticsData.kpi.avg_score}%`} 
                trend="+3%" 
                trendLabel="improvement"
                trendUp={true}
                icon={Award}
                color="text-emerald-600"
                bg="bg-emerald-50"
                borderColor="border-emerald-100"
            />
            <MetricCard 
                label="Solving Speed" 
                value={analyticsData.kpi.speed} 
                trend="-5s" 
                trendLabel="improvement"
                trendUp={true}
                icon={Timer}
                color="text-blue-600"
                bg="bg-blue-50"
                borderColor="border-blue-100"
            />
        </div>

        {/* Dynamic Trends Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden group">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Strategy Analysis</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.1em]">
                            {activeChartTab === 'scores' ? 'Score Progression %' : activeChartTab === 'accuracy' ? 'Topic Accuracy Breakdown' : 'Answering Latency Trends'}
                        </p>
                    </div>
                    
                    <div className="flex p-1.5 bg-slate-100 rounded-2xl overflow-x-auto">
                        <button onClick={() => setActiveChartTab('scores')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${activeChartTab === 'scores' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                            <TrendingUp className="w-3.5 h-3.5" /> Score History
                        </button>
                        <button onClick={() => setActiveChartTab('accuracy')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${activeChartTab === 'accuracy' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                            <ShieldCheck className="w-3.5 h-3.5" /> Accuracy %
                        </button>
                        <button onClick={() => setActiveChartTab('speed')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${activeChartTab === 'speed' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Timer className="w-3.5 h-3.5" /> Answer Speed
                        </button>
                    </div>
                </div>
                
                <div className="w-full h-[320px] md:h-[380px] mt-4">
                     {activeChartTab === 'scores' && (
                        <IntelligenceLineChart data={analyticsData.history.data.length > 0 ? analyticsData.history.data : [0]} labels={analyticsData.history.labels.length > 0 ? analyticsData.history.labels : ['No Data']} color="#6366f1" labelSuffix="%" />
                     )}
                     {activeChartTab === 'accuracy' && (
                        <AccuracyBarChart data={analyticsData.subjects.map((s:any) => s.value)} labels={analyticsData.subjects.map((s:any) => s.name)} />
                     )}
                     {activeChartTab === 'speed' && (
                        <IntelligenceLineChart data={analyticsData.history.speed_data.length > 0 ? analyticsData.history.speed_data : [0]} labels={analyticsData.history.labels.length > 0 ? analyticsData.history.labels : ['No Data']} color="#f59e0b" labelSuffix="s" />
                     )}
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col items-center">
                 <div className="w-full text-center mb-8">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Strategic Mastery</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1">Holistic Assessment Readiness</p>
                 </div>

                 <div className="flex-1 w-full flex items-center justify-center">
                    <StrategicRadarChart data={analyticsData.strategic} />
                 </div>

                 <div className="w-full mt-8 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-50"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Current</span>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 opacity-60">
                        <div className="w-3 h-3 rounded-full bg-slate-300 ring-4 ring-slate-100"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Target</span>
                    </div>
                 </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm relative group overflow-hidden">
                <div className="flex justify-between items-start mb-10">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Subject Intelligence</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.1em]">Section-wise accuracy & speed balance</p>
                    </div>
                </div>
                
                <div className="w-full h-[280px] overflow-x-auto custom-scrollbar">
                    <div className="min-w-[500px] h-full flex items-end">
                        <SubjectPerformanceChart subjects={analyticsData.subjects} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start mb-10">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Examination Activity</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.1em]">Daily mock test contribution activity</p>
                    </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center w-full mt-4">
                    <AssessmentHeatmap dailyData={analyticsData.heatmap} />
                </div>

                <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                         <span>Beginner</span>
                         <div className="flex gap-[3px]">
                             <div className="w-4 h-4 rounded-md bg-slate-50 border border-slate-100"></div>
                             <div className="w-4 h-4 rounded-md bg-indigo-200"></div>
                             <div className="w-4 h-4 rounded-md bg-indigo-400"></div>
                             <div className="w-4 h-4 rounded-md bg-indigo-600"></div>
                         </div>
                         <span>Proctor</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

/* --- SUB-COMPONENTS --- */

const MetricCard = ({ label, value, trend, trendLabel, trendUp, icon: Icon, color, bg, borderColor }: any) => (
    <div className={`bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}>
        <div className={`absolute -top-4 -right-4 w-24 h-24 ${bg} rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-300 scale-150`}></div>
        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className={`p-4 rounded-[1.25rem] ${bg} ${color} border-2 ${borderColor} group-hover:scale-110 transition-all shadow-lg`}>
                <Icon className="w-7 h-7" />
            </div>
            <div className={`flex items-center gap-2 text-[11px] font-black px-3 py-1.5 rounded-xl border-2 ${trendUp ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100'} uppercase tracking-tight`}>
                {trendUp ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                {trend}
            </div>
        </div>
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 relative z-10">{value}</h3>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">{label}</p>
        <p className="text-[10px] text-slate-400 font-bold italic opacity-70 relative z-10">{trendLabel}</p>
    </div>
);

const IntelligenceLineChart = ({ data, labels, color, labelSuffix = '' }: { data: number[], labels: string[], color: string, labelSuffix?: string }) => {
    const width = 800;
    const height = 300;
    const paddingY = 40;
    const minVal = Math.min(...data) === Math.max(...data) ? 0 : Math.min(...data) * 0.8;
    const maxVal = Math.max(...data) === 0 ? 100 : Math.max(...data) * 1.1;

    const points = data.map((d, i) => ({
        x: data.length > 1 ? (i / (data.length - 1)) * width : width/2,
        y: height - ((d - minVal) / (maxVal - minVal)) * (height - paddingY),
    }));

    let pathD = `M ${points[0].x} ${points[0].y}`;
    if (data.length > 1) {
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 2;
            pathD += ` C ${cp1x} ${p0.y}, ${cp1x} ${p1.y}, ${p1.x} ${p1.y}`;
        }
    }

    return (
        <div className="w-full h-full relative group animate-fade-in-up">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                    <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`${pathD} L ${width} ${height} L 0 ${height} Z`} fill={`url(#gradient-${color})`} />
                <path d={pathD} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                    <g key={i} className="group/dot">
                         <circle cx={p.x} cy={p.y} r="15" fill="transparent" className="cursor-pointer" />
                         <circle cx={p.x} cy={p.y} r="6" fill="white" stroke={color} strokeWidth="3" />
                    </g>
                ))}
            </svg>
            <div className="flex justify-between mt-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {labels.length > 5 ? labels.filter((_, i) => i % 2 === 0).map((l, i) => <span key={i}>{l}</span>) : labels.map((l, i) => <span key={i}>{l}</span>)}
            </div>
        </div>
    );
};

const AccuracyBarChart = ({ data, labels }: { data: number[], labels: string[] }) => (
    <div className="w-full h-full flex items-end justify-between px-6 pb-8 animate-fade-in gap-5">
        {data.length === 0 && <div className="text-slate-300 text-sm italic w-full text-center">No subject data available</div>}
        {data.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-4 group relative h-full justify-end max-w-[60px]">
                <div className="w-full relative flex items-end justify-center h-[85%] bg-slate-50 rounded-full border border-slate-100/50 overflow-hidden">
                    <div className={`w-full mx-1 mb-1 rounded-full transition-all duration-1000 bg-indigo-500`} style={{ height: `${val}%` }}></div>
                </div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest truncate w-full text-center">{labels[i]}</span>
            </div>
        ))}
    </div>
);

const StrategicRadarChart = ({ data }: { data: any[] }) => {
    const size = 300;
    const center = size / 2;
    const radius = 100;
    const getCoords = (val: number, idx: number) => {
        const r = (val / 100) * radius;
        const theta = (idx * 2 * Math.PI) / data.length - Math.PI / 2;
        return { x: center + r * Math.cos(theta), y: center + r * Math.sin(theta) };
    };
    const dataPath = data.map((c, i) => {
        const { x, y } = getCoords(c.value, i);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') + ' Z';

    return (
        <svg width={size} height={size} className="overflow-visible">
            {[100, 75, 50, 25].map(ring => (
                <path key={ring} d={data.map((_, i) => { const { x, y } = getCoords(ring, i); return `${i === 0 ? 'M' : 'L'} ${x} ${y}`; }).join(' ') + ' Z'} fill="none" stroke="#f1f5f9" strokeWidth="1" />
            ))}
            <path d={dataPath} fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth="4" />
            {data.map((c, i) => {
                const { x, y } = getCoords(c.value, i);
                const labelPos = getCoords(135, i);
                return (
                    <g key={i}>
                        <circle cx={x} cy={y} r="4" fill="white" stroke="#6366f1" strokeWidth="2" />
                        <text x={labelPos.x} y={labelPos.y} textAnchor="middle" className="text-[10px] font-black uppercase fill-slate-400">{c.name}</text>
                    </g>
                );
            })}
        </svg>
    );
};

const SubjectPerformanceChart = ({ subjects }: { subjects: any[] }) => (
    <div className="w-full h-full flex items-end justify-between px-2 pb-8 gap-8">
        {subjects.length === 0 && <div className="text-slate-300 text-sm italic w-full text-center">No data available</div>}
        {subjects.map((sub, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-4 group relative h-full justify-end min-w-[50px]">
                <div className="w-[45%] h-full bg-slate-50 rounded-full relative overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ height: `${sub.value}%` }}></div>
                </div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter truncate w-full text-center">{sub.name}</span>
            </div>
        ))}
    </div>
);

const AssessmentHeatmap = ({ dailyData = {} }: { dailyData?: Record<string, number> }) => {
    // Generate dates for last 24 weeks
    const weeks = [];
    const today = new Date();
    
    for (let w = 23; w >= 0; w--) {
        const week = [];
        for (let d = 0; d < 7; d++) {
            const date = new Date(today);
            date.setDate(today.getDate() - (w * 7 + (6 - d)));
            const dateStr = date.toISOString().split('T')[0];
            const count = dailyData[dateStr] || 0;
            // 0 -> 0, 1 -> 1, 2-3 -> 2, 4+ -> 3
            const level = count === 0 ? 0 : count === 1 ? 1 : count < 4 ? 2 : 3;
            week.push({ level, date: dateStr });
        }
        weeks.push(week);
    }

    return (
        <div className="w-full flex gap-[4px] justify-between h-[120px]">
            {weeks.map((week, w) => (
                <div key={w} className="flex-1 flex flex-col gap-[4px]">
                    {week.map((day, d) => (
                        <div 
                           key={d} 
                           title={`${day.date}: ${dailyData[day.date] || 0} exams`}
                           className={`flex-1 rounded-[3px] ${['bg-slate-50', 'bg-indigo-200', 'bg-indigo-400', 'bg-indigo-600'][day.level]} transition-all hover:scale-110 cursor-pointer`}
                        ></div>
                    ))}
                </div>
            ))}
        </div>
    );
};
