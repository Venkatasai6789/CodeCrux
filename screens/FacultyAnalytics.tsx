
import React, { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { User } from '../types';
import { useAuth } from '../services/authContext';
import { 
  TrendingUp, Users, BookOpen, Activity, ChevronDown, Download, 
  Share2, FileText, AlertTriangle, CheckCircle, Search, Filter,
  MoreHorizontal, ArrowUpRight, ArrowDownRight, Zap, Sparkles
} from 'lucide-react';

interface FacultyAnalyticsProps {
  onNavigate: (path: string) => void;
}

// --- Mock Data ---
const ANALYTICS_DATA = {
  overview: {
    totalStudents: 142,
    avgPerformance: 78.5,
    completionRate: 92,
    engagementScore: 85
  },
  trend: [65, 68, 72, 70, 75, 78, 80, 82, 79, 85, 88, 86], // 12 weeks
  grades: [
    { label: 'A (80-100%)', value: 35, color: '#10B981' }, // Emerald
    { label: 'B (70-80%)', value: 45, color: '#14B8A6' }, // Teal
    { label: 'C (60-70%)', value: 15, color: '#F59E0B' }, // Amber
    { label: 'D (50-60%)', value: 4, color: '#F97316' },  // Orange
    { label: 'F (<50%)', value: 1, color: '#EF4444' }     // Red
  ],
  statsSummary: {
    topPerformer: { name: 'Sarah Chen', score: '98%' },
    strugglingCount: 5,
    mostImproved: { name: 'David Lee', score: '+15%' },
    consistentCount: 82
  },
  exams: [
    { id: 1, name: 'Midterm Exam', date: 'Oct 15', avg: 76, pass: '88%', high: 98, low: 45, issues: 2, attention: 85 },
    { id: 2, name: 'React Fundamentals', date: 'Nov 02', avg: 82, pass: '94%', high: 100, low: 52, issues: 0, attention: 92 },
    { id: 3, name: 'System Design Quiz', date: 'Nov 10', avg: 72, pass: '82%', high: 95, low: 35, issues: 5, attention: 78 },
    { id: 4, name: 'Final Project', date: 'Dec 01', avg: 88, pass: '98%', high: 100, low: 60, issues: 1, attention: 95 },
  ],
  proctoring: {
    totalExams: 450,
    incidents: 12,
    falsePositives: 4,
    flaggedStudents: 8,
    avgAttention: 88
  },
  engagement: {
    engaged: [
      { name: 'Sarah Chen', score: 98 },
      { name: 'Alex Johnson', score: 95 },
      { name: 'Emily Davis', score: 92 }
    ],
    atRisk: [
      { name: 'James Wilson', score: 45 },
      { name: 'Michael Brown', score: 52 }
    ],
    courseCompletion: [
      { name: 'CS101', rate: 95 },
      { name: 'CS102', rate: 88 },
      { name: 'BIO200', rate: 72 }
    ]
  }
};

export const FacultyAnalyticsScreen: React.FC<FacultyAnalyticsProps> = ({ onNavigate }) => {
  const { user: authUser } = useAuth();
  const facultyUser: User = { id: String(authUser?.id || ''), name: authUser ? `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.username : 'Faculty', email: authUser?.email || '', role: 'faculty' };
  const [period, setPeriod] = useState('This Semester');

  return (
    <DashboardLayout currentUser={facultyUser} onNavigate={onNavigate} currentPath="/analytics">
      <div className="max-w-[1600px] mx-auto pb-24 animate-slide-up space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Teaching Analytics</h1>
                <p className="text-sm text-slate-500 mt-1">Insights into student performance and course effectiveness.</p>
            </div>
            
            <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all min-w-[160px] justify-between">
                    {period} <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                {/* Dropdown would go here in real implementation */}
            </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                label="Total Students" 
                value={ANALYTICS_DATA.overview.totalStudents} 
                icon={Users} 
                color="text-[#4F46E5]" 
                bg="bg-indigo-50"
            />
            <StatCard 
                label="Avg Performance" 
                value={`${ANALYTICS_DATA.overview.avgPerformance}%`} 
                icon={TrendingUp} 
                color={ANALYTICS_DATA.overview.avgPerformance > 80 ? 'text-[#10B981]' : 'text-[#F59E0B]'} 
                bg={ANALYTICS_DATA.overview.avgPerformance > 80 ? 'bg-emerald-50' : 'bg-amber-50'}
            />
            <StatCard 
                label="Course Completion" 
                value={`${ANALYTICS_DATA.overview.completionRate}%`} 
                icon={BookOpen} 
                color="text-[#10B981]" 
                bg="bg-emerald-50"
            />
            <StatCard 
                label="Engagement Score" 
                value={`${ANALYTICS_DATA.overview.engagementScore}%`} 
                icon={Activity} 
                color="text-[#4F46E5]" 
                bg="bg-indigo-50"
            />
        </div>

        {/* Performance Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Class Performance Trend</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Average Score Over Time</p>
                </div>
                <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                        <span className="text-slate-600">Avg Score</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-1 rounded-full bg-amber-400"></div>
                        <span className="text-slate-600">Passing Threshold</span>
                    </div>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <PerformanceTrendChart data={ANALYTICS_DATA.trend} />
            </div>
        </div>

        {/* Student Distribution & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold text-slate-900 self-start mb-6">Grade Distribution</h3>
                <GradeDistributionChart data={ANALYTICS_DATA.grades} />
                <div className="grid grid-cols-3 gap-x-8 gap-y-2 mt-8">
                    {ANALYTICS_DATA.grades.map((g, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }}></div>
                            <span className="text-slate-600 font-medium">{g.label}: <span className="font-bold text-slate-900">{g.value}%</span></span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats Summary List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Performance Highlights</h3>
                <div className="space-y-6">
                    <SummaryItem 
                        label="Top Performer" 
                        value={ANALYTICS_DATA.statsSummary.topPerformer.name} 
                        subValue={ANALYTICS_DATA.statsSummary.topPerformer.score}
                        icon={CheckCircle}
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                    />
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-lg text-red-600 shadow-sm">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-red-800 uppercase tracking-wider">At Risk</p>
                                <p className="text-lg font-bold text-red-900">{ANALYTICS_DATA.statsSummary.strugglingCount} Students</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-white text-red-600 text-xs font-bold rounded-lg border border-red-200 hover:bg-red-50 transition-colors shadow-sm">
                            Reach Out
                        </button>
                    </div>
                    <SummaryItem 
                        label="Most Improved" 
                        value={ANALYTICS_DATA.statsSummary.mostImproved.name} 
                        subValue={ANALYTICS_DATA.statsSummary.mostImproved.score}
                        icon={TrendingUp}
                        color="text-indigo-600"
                        bg="bg-indigo-50"
                    />
                    <SummaryItem 
                        label="Consistent Performers" 
                        value={`${ANALYTICS_DATA.statsSummary.consistentCount} Students`} 
                        subValue=">80% Avg"
                        icon={Activity}
                        color="text-blue-600"
                        bg="bg-blue-50"
                    />
                </div>
            </div>
        </div>

        {/* Exam Analytics Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Exam Performance Report</h3>
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Exam Name</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Avg Score</th>
                            <th className="px-6 py-4">Pass Rate</th>
                            <th className="px-6 py-4">High/Low</th>
                            <th className="px-6 py-4">Integrity Issues</th>
                            <th className="px-6 py-4 text-right">Avg Attention</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {ANALYTICS_DATA.exams.map((exam) => (
                            <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{exam.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{exam.date}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${exam.avg > 80 ? 'text-emerald-600' : 'text-slate-700'}`}>{exam.avg}%</span>
                                        {/* Mini Sparkline placeholder */}
                                        <div className="w-12 h-4 bg-slate-100 rounded-sm"></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700">{exam.pass}</td>
                                <td className="px-6 py-4 text-xs font-mono text-slate-600">
                                    <span className="text-emerald-600 font-bold">{exam.high}</span> / <span className="text-red-600 font-bold">{exam.low}</span>
                                </td>
                                <td className="px-6 py-4">
                                    {exam.issues > 0 ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                            {exam.issues} <AlertTriangle className="w-3 h-3" />
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-400 font-medium">None</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`text-sm font-bold ${exam.attention < 80 ? 'text-amber-600' : 'text-slate-700'}`}>
                                        {exam.attention}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Proctoring Insights & Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Proctoring Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Proctoring & Integrity</h3>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">30 Days</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Exams Proctored</p>
                        <p className="text-2xl font-bold text-slate-900">{ANALYTICS_DATA.proctoring.totalExams}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-xs text-red-700 font-bold uppercase tracking-wider mb-2">Confirmed Incidents</p>
                        <p className="text-2xl font-bold text-red-700">{ANALYTICS_DATA.proctoring.incidents}</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-2">Flagged Students</p>
                        <p className="text-2xl font-bold text-amber-700">{ANALYTICS_DATA.proctoring.flaggedStudents}</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-2">Avg Attention</p>
                        <p className="text-2xl font-bold text-emerald-700">{ANALYTICS_DATA.proctoring.avgAttention}%</p>
                    </div>
                </div>
                <button className="w-full py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors">
                    View Detailed Integrity Report
                </button>
            </div>

            {/* Engagement Metrics */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Student Engagement</h3>
                
                <div className="space-y-6">
                    {/* Top Engaged */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Most Engaged</h4>
                        <div className="space-y-2">
                            {ANALYTICS_DATA.engagement.engaged.map((s, i) => (
                                <div key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                            {i + 1}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{s.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${s.score}%` }}></div>
                                        </div>
                                        <span className="text-xs font-bold text-indigo-600">{s.score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Completion Rates Chart */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Completion Rates by Course</h4>
                        <div className="space-y-3">
                            {ANALYTICS_DATA.engagement.courseCompletion.map((c, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] mb-1 font-medium">
                                        <span className="text-slate-600">{c.name}</span>
                                        <span className="text-slate-900">{c.rate}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.rate}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="bg-[#EEF2FF] rounded-2xl border-l-4 border-[#4F46E5] p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Zap className="w-32 h-32 text-indigo-600" />
            </div>
            
            <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[#4F46E5]">AI Insights & Recommendations</h3>
                    <p className="text-sm text-indigo-700/80">Based on recent performance data</p>
                </div>
            </div>

            <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-indigo-900">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                    Students struggled most with <span className="font-bold">Question 7 (Recursion)</span> in the Algorithms Final. Consider reviewing this topic in the next session.
                </li>
                <li className="flex items-start gap-2 text-sm text-indigo-900">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                    3 students including <span className="font-bold">James Wilson</span> are at high risk of failing based on current trajectory. Early intervention recommended.
                </li>
                <li className="flex items-start gap-2 text-sm text-indigo-900">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                    Average completion time improved by <span className="font-bold text-emerald-600">12%</span> compared to the last exam, indicating better time management.
                </li>
            </ul>

            <button className="px-4 py-2 bg-white text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm">
                Generate Detailed AI Report
            </button>
        </div>

        {/* Export Footer */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row gap-4 justify-end">
            <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Share2 className="w-4 h-4" /> Share with Dept
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <FileText className="w-4 h-4" /> Export CSV
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Download className="w-4 h-4" /> Download PDF Report
            </button>
        </div>

      </div>
    </DashboardLayout>
  );
};

// --- Sub-Components ---

const StatCard = ({ label, value, icon: Icon, color, bg }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${bg} ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
        <h3 className={`text-3xl font-bold ${color}`}>{value}</h3>
        <p className="text-sm text-slate-500 font-medium mt-1">{label}</p>
    </div>
);

const SummaryItem = ({ label, value, subValue, icon: Icon, color, bg }: any) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-4">
            <div className={`p-3 bg-white rounded-lg ${color} shadow-sm`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-bold text-slate-900">{value}</p>
            </div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded bg-white border border-slate-200 ${color}`}>
            {subValue}
        </span>
    </div>
);

// Custom SVG Charts

const PerformanceTrendChart = ({ data }: { data: number[] }) => {
    const height = 300;
    const width = 800; // viewBox width
    const padding = 20;
    const maxY = 100;

    const points = data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
        const y = height - padding - (d / maxY) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');

    const fillPath = `M ${padding},${height-padding} L ${points.split(' ')[0]} ${points.replace(/,/g, ' ')} L ${width-padding},${height-padding} Z`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
                <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                </linearGradient>
            </defs>
            
            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map(val => (
                <line 
                    key={val} 
                    x1={padding} 
                    y1={height - padding - (val/100)*(height-2*padding)} 
                    x2={width - padding} 
                    y2={height - padding - (val/100)*(height-2*padding)} 
                    stroke="#E2E8F0" 
                    strokeWidth="1" 
                    strokeDasharray={val === 60 ? "4" : ""} // Dash for passing threshold if roughly 60
                />
            ))}

            {/* Threshold Line (60%) */}
            <line 
                x1={padding} 
                y1={height - padding - 0.6*(height-2*padding)} 
                x2={width - padding} 
                y2={height - padding - 0.6*(height-2*padding)} 
                stroke="#F59E0B" 
                strokeWidth="2" 
                strokeDasharray="6" 
            />

            <path d={fillPath} fill="url(#trendGradient)" />
            <polyline points={points.replace(/,/g, ' ')} fill="none" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Dots */}
            {data.map((d, i) => {
                const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
                const y = height - padding - (d / maxY) * (height - 2 * padding);
                return (
                    <circle key={i} cx={x} cy={y} r="4" fill="white" stroke="#4F46E5" strokeWidth="2" className="hover:scale-150 transition-transform cursor-pointer">
                        <title>Week {i+1}: {d}%</title>
                    </circle>
                );
            })}
        </svg>
    );
};

const GradeDistributionChart = ({ data }: { data: { value: number, color: string }[] }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="relative w-64 h-64">
            <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full overflow-visible">
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
                            className="hover:opacity-90 transition-opacity cursor-pointer stroke-white stroke-[0.02]"
                        />
                    );
                })}
            </svg>
            {/* Center Hole for Donut effect */}
            <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-bold text-slate-800">{total}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">Students</span>
            </div>
        </div>
    );
};
