
import React, { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { User } from '../types';
import { useAuth } from '../services/authContext';
import { 
  Download, Calendar, ChevronDown, Users, Clock, Award, 
  CheckCircle, AlertTriangle, Search, Filter, MoreHorizontal,
  TrendingUp, TrendingDown, FileText, Mail, ShieldAlert
} from 'lucide-react';

interface ExamAnalyticsProps {
  onNavigate: (path: string) => void;
}

// Mock Data
const EXAM_DATA = {
  title: 'Advanced Java Final',
  date: 'Oct 24, 2024',
  stats: {
    totalStudents: 45,
    avgScore: 82.5,
    completionRate: 98,
    avgTime: '55m',
    trends: {
      students: '+5%',
      score: '+2.4%',
      completion: '+1%'
    }
  },
  distribution: [
    { range: '0-20', count: 1 },
    { range: '20-40', count: 3 },
    { range: '40-60', count: 8 },
    { range: '60-80', count: 15 },
    { range: '80-100', count: 18 }
  ],
  advancedStats: {
    median: 85,
    mode: 88,
    stdDev: 8.5,
    highest: { score: 98, student: 'Sarah Chen' },
    lowest: { score: 42, student: 'James Wilson' }
  },
  proctoring: {
    avgAttention: 88,
    flagged: 3,
    incidents: 5,
    compliance: 92
  },
  students: [
    { id: '1', name: 'Sarah Chen', score: 98, grade: 'A+', time: '45m', attention: 95, status: 'Pass' },
    { id: '2', name: 'Alex Johnson', score: 92, grade: 'A', time: '52m', attention: 92, status: 'Pass' },
    { id: '3', name: 'Maria Garcia', score: 78, grade: 'C+', time: '58m', attention: 65, status: 'Review' },
    { id: '4', name: 'James Wilson', score: 42, grade: 'F', time: '30m', attention: 45, status: 'Fail' },
    { id: '5', name: 'Emily Davis', score: 88, grade: 'B+', time: '50m', attention: 89, status: 'Pass' },
    { id: '6', name: 'Michael Brown', score: 85, grade: 'B', time: '55m', attention: 90, status: 'Pass' },
    { id: '7', name: 'David Lee', score: 72, grade: 'C', time: '60m', attention: 82, status: 'Pass' },
  ],
  flagged: [
    { id: 'f1', student: 'James Wilson', reason: 'Multiple faces detected', time: '10:45 AM', integrity: 45 },
    { id: 'f2', student: 'Maria Garcia', reason: 'Frequent gaze aversion', time: '11:15 AM', integrity: 65 },
  ]
};

export const ExamAnalyticsScreen: React.FC<ExamAnalyticsProps> = ({ onNavigate }) => {
  const { user: authUser } = useAuth();
  const facultyUser: User = { id: String(authUser?.id || ''), name: authUser ? `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.username : 'Faculty', email: authUser?.email || '', role: 'faculty' };
  const [timeFilter, setTimeFilter] = useState('Last 30 days');

  return (
    <DashboardLayout currentUser={facultyUser} onNavigate={onNavigate} currentPath="/reports">
      <div className="max-w-[1600px] mx-auto pb-24 animate-slide-up">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Exam Analytics: {EXAM_DATA.title}</h1>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Conducted on {EXAM_DATA.date}
                </p>
            </div>
            <div className="flex gap-3">
                <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
                        {timeFilter} <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                    {/* Dropdown would go here */}
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
                    <Download className="w-4 h-4" /> Export
                </button>
            </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
                label="Total Students" 
                value={EXAM_DATA.stats.totalStudents} 
                trend={EXAM_DATA.stats.trends.students}
                icon={Users}
                color="text-indigo-600"
                bg="bg-indigo-50"
            />
            <StatCard 
                label="Average Score" 
                value={`${EXAM_DATA.stats.avgScore}%`} 
                trend={EXAM_DATA.stats.trends.score}
                icon={Award}
                color="text-emerald-600"
                bg="bg-emerald-50"
                subLabel="Grade B"
            />
            <StatCard 
                label="Completion Rate" 
                value={`${EXAM_DATA.stats.completionRate}%`} 
                trend={EXAM_DATA.stats.trends.completion}
                icon={CheckCircle}
                color="text-blue-600"
                bg="bg-blue-50"
            />
            <StatCard 
                label="Avg. Time Taken" 
                value={EXAM_DATA.stats.avgTime} 
                trend="On Track"
                icon={Clock}
                color="text-amber-600"
                bg="bg-amber-50"
            />
        </div>

        {/* Distribution & Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Score Distribution Histogram */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Score Distribution</h3>
                    <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
                <div className="h-64 w-full">
                    <HistogramChart data={EXAM_DATA.distribution} />
                </div>
            </div>

            {/* Statistics Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Statistics Summary</h3>
                    <div className="space-y-5">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 font-medium">Median Score</span>
                            <span className="text-xl font-bold text-slate-900">{EXAM_DATA.advancedStats.median}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 font-medium">Mode Score</span>
                            <span className="text-sm font-semibold text-slate-700">{EXAM_DATA.advancedStats.mode}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 font-medium">Standard Deviation</span>
                            <span className="text-sm font-semibold text-slate-700">{EXAM_DATA.advancedStats.stdDev}</span>
                        </div>
                        <div className="h-px bg-slate-100 my-2"></div>
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-xs text-slate-400 font-bold uppercase block mb-0.5">Highest</span>
                                <span className="text-sm text-slate-600">{EXAM_DATA.advancedStats.highest.student}</span>
                            </div>
                            <span className="text-lg font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{EXAM_DATA.advancedStats.highest.score}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-xs text-slate-400 font-bold uppercase block mb-0.5">Lowest</span>
                                <span className="text-sm text-slate-600">{EXAM_DATA.advancedStats.lowest.student}</span>
                            </div>
                            <span className="text-lg font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{EXAM_DATA.advancedStats.lowest.score}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Proctoring & Integrity */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Proctoring Report Summary</h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">System Secure</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Avg Attention</p>
                        <p className="text-3xl font-bold text-indigo-600">{EXAM_DATA.proctoring.avgAttention}%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Flagged Students</p>
                        <p className={`text-3xl font-bold ${EXAM_DATA.proctoring.flagged > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                            {EXAM_DATA.proctoring.flagged}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Incidents</p>
                        <p className={`text-3xl font-bold ${EXAM_DATA.proctoring.incidents > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                            {EXAM_DATA.proctoring.incidents}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Compliance</p>
                        <p className="text-3xl font-bold text-emerald-600">{EXAM_DATA.proctoring.compliance}%</p>
                    </div>
                </div>
            </div>

            {/* Flagged List - Only show if issues exist */}
            <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <ShieldAlert className="w-32 h-32 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" /> Review Required
                </h3>
                <div className="space-y-3 relative z-10">
                    {EXAM_DATA.flagged.map((item) => (
                        <div key={item.id} className="bg-red-50/50 rounded-xl p-4 border border-red-100">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-sm text-slate-800">{item.student}</span>
                                <span className="text-xs font-mono text-slate-500">{item.time}</span>
                            </div>
                            <p className="text-xs text-slate-600 mb-3">{item.reason}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-red-600 bg-white px-2 py-0.5 rounded border border-red-100">
                                    Integrity: {item.integrity}%
                                </span>
                                <button className="text-[10px] font-bold text-indigo-600 hover:underline">Review</button>
                            </div>
                        </div>
                    ))}
                    {EXAM_DATA.flagged.length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-sm">No flagged submissions.</div>
                    )}
                </div>
            </div>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-slate-900">Individual Performance</h3>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Find student..." 
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-64"
                        />
                    </div>
                    <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Score</th>
                            <th className="px-6 py-4">Grade</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Attention</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {EXAM_DATA.students.map((student) => (
                            <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                                <td className="px-6 py-4 font-bold text-indigo-600">{student.score}%</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                        student.grade.startsWith('A') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        student.grade.startsWith('F') ? 'bg-red-50 text-red-700 border-red-100' :
                                        'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                        {student.grade}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{student.time}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${student.attention > 80 ? 'bg-emerald-500' : student.attention > 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${student.attention}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-medium text-slate-600">{student.attention}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-bold ${
                                        student.status === 'Pass' ? 'text-emerald-600' : 
                                        student.status === 'Fail' ? 'text-red-600' : 'text-amber-600'
                                    }`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
                <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
                <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-50">Next</button>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                <FileText className="w-4 h-4" /> Download PDF Report
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                <Download className="w-4 h-4" /> Export CSV Data
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                <Mail className="w-4 h-4" /> Email Results to Students
            </button>
        </div>

      </div>
    </DashboardLayout>
  );
};

// Sub-components
const StatCard = ({ label, value, trend, icon: Icon, color, bg, subLabel }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg ${bg} ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                <TrendingUp className="w-3 h-3" /> {trend}
            </div>
        </div>
        <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            {subLabel && <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{subLabel}</span>}
        </div>
        <p className="text-sm text-slate-500 font-medium mt-1">{label}</p>
    </div>
);

const HistogramChart = ({ data }: { data: { range: string, count: number }[] }) => {
    const maxCount = Math.max(...data.map(d => d.count));
    const height = 200;
    
    return (
        <div className="w-full h-full flex items-end justify-between gap-2 px-2 pt-6">
            {data.map((d, i) => {
                const barHeight = (d.count / maxCount) * 100;
                return (
                    <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end">
                        <div className="relative w-full max-w-[60px] h-full flex items-end">
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {d.count} Students
                            </div>
                            
                            {/* Bar */}
                            <div 
                                className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500 group-hover:from-indigo-500 group-hover:to-indigo-300 opacity-90 group-hover:opacity-100"
                                style={{ height: `${barHeight}%` }}
                            ></div>
                        </div>
                        <span className="text-xs font-medium text-slate-500 mt-2">{d.range}%</span>
                    </div>
                );
            })}
        </div>
    );
};
