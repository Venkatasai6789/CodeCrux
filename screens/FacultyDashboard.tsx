
import React from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { User } from '../types';
import { 
  Users, 
  FileText, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  MoreHorizontal,
  ChevronRight,
  Plus,
  Search,
  Filter,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface FacultyDashboardProps {
  onNavigate: (path: string) => void;
}

export const FacultyDashboardScreen: React.FC<FacultyDashboardProps> = ({ onNavigate }) => {
  // Mock Faculty User
  const facultyUser: User = {
    id: 'f1',
    name: 'Professor Smith',
    email: 'admin@sparkless.com',
    role: 'faculty'
  };

  // Mock Data
  const stats = [
    { label: 'Active Exams', value: 3, sub: 'Today', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Under Supervision', value: 84, sub: 'Students', icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending Reviews', value: 12, sub: 'Urgent', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Class Average', value: '82.5%', sub: '+2.4%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const examsToday = [
    { id: 1, title: 'CS101: Midterm Exam', time: '10:00 AM - 12:00 PM', status: 'Completed', students: 45, color: 'emerald' },
    { id: 2, title: 'CS302: Algorithms Final', time: '02:00 PM - 05:00 PM', status: 'In Progress', students: 28, color: 'blue' },
    { id: 3, title: 'DS201: Data Structures', time: '06:00 PM - 08:00 PM', status: 'Upcoming', students: 32, color: 'amber' },
  ];

  const submissions = [
    { id: 1, name: 'Alex Johnson', exam: 'CS302: Algorithms', score: '92%', status: 'Reviewed', integrity: '98%', date: 'Today, 2:30 PM' },
    { id: 2, name: 'Maria Garcia', exam: 'CS302: Algorithms', score: '--', status: 'Flagged', integrity: '45%', date: 'Today, 2:45 PM' },
    { id: 3, name: 'James Wilson', exam: 'CS302: Algorithms', score: '78%', status: 'Pending', integrity: '92%', date: 'Today, 2:50 PM' },
    { id: 4, name: 'Sarah Chen', exam: 'CS101: Midterm', score: '88%', status: 'Reviewed', integrity: '99%', date: 'Yesterday' },
    { id: 5, name: 'Michael Brown', exam: 'CS101: Midterm', score: '65%', status: 'Pending', integrity: '88%', date: 'Yesterday' },
  ];

  return (
    <DashboardLayout currentUser={facultyUser} onNavigate={onNavigate} currentPath="/faculty-dashboard">
      <div className="max-w-[1600px] mx-auto pb-24 animate-slide-up">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Welcome back, {facultyUser.name}</h1>
                <p className="text-sm text-[#64748B]">Here's your teaching overview for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
            </div>
            <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    <Clock className="w-4 h-4" />
                    Schedule
                </button>
                <button 
                    onClick={() => onNavigate('/faculty-exams/create')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338ca] shadow-md shadow-indigo-500/20 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Create Exam
                </button>
            </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        {i === 2 && typeof stat.value === 'number' && stat.value > 0 && (
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className={`text-2xl font-bold ${stat.label === 'Pending Reviews' && typeof stat.value === 'number' && stat.value > 0 ? 'text-[#EF4444]' : 'text-[#1E293B]'}`}>
                            {stat.value}
                        </h3>
                        <span className="text-xs font-medium text-slate-400">{stat.sub}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">{stat.label}</p>
                </div>
            ))}
        </div>

        {/* Today's Exams Section */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1E293B]">Exams Today</h2>
                <button className="text-xs font-bold text-[#4F46E5] hover:underline flex items-center gap-1">
                    View Calendar <ChevronRight className="w-3 h-3" />
                </button>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {examsToday.map((exam) => (
                    <div key={exam.id} className="min-w-[300px] bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:border-indigo-200 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border 
                                ${exam.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse' : 
                                  exam.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                  'bg-amber-50 text-amber-700 border-amber-100'}
                            `}>
                                {exam.status}
                            </span>
                            <button className="text-slate-300 hover:text-indigo-600 transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <h3 className="font-bold text-[#1E293B] mb-1">{exam.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                            <Clock className="w-3 h-3" /> {exam.time}
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                {exam.students} Students
                            </div>
                            <button 
                                onClick={() => onNavigate('/live-monitoring')}
                                className="text-xs font-bold bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white px-3 py-1.5 rounded-md shadow-sm hover:shadow-md transition-all active:scale-95 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-200"
                            >
                                Monitor Exam
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Class Performance & Stats Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
            
            {/* Chart Area (60%) */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-[#1E293B]">Class Performance</h2>
                    <select className="bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 rounded-lg px-2 py-1 outline-none">
                        <option>Last 30 Days</option>
                        <option>Last Semester</option>
                    </select>
                </div>
                
                {/* Custom SVG Line Chart */}
                <div className="h-[240px] w-full relative">
                    <PerformanceLineChart />
                </div>
            </div>

            {/* Stats Card (40%) */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                <div>
                    <h2 className="text-lg font-bold text-[#1E293B] mb-6">Statistics Breakdown</h2>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Class Average</span>
                                <span className="text-2xl font-bold text-[#4F46E5]">82.5%</span>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                                <span className="text-[10px] text-emerald-600 font-bold uppercase block mb-1">Highest</span>
                                <span className="text-lg font-bold text-emerald-800">98%</span>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                                <span className="text-[10px] text-orange-600 font-bold uppercase block mb-1">Lowest</span>
                                <span className="text-lg font-bold text-orange-800">64%</span>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs text-slate-500 font-medium block mb-2">Completion Rate</span>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-[#4F46E5] h-full rounded-full w-[92%]"></div>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-slate-400">0%</span>
                                <span className="text-[10px] text-slate-400">92% Completed</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Avg Time: 45m 32s
                    </span>
                    <button className="text-indigo-600 font-bold hover:underline">View Full Report</button>
                </div>
            </div>
        </div>

        {/* Recent Submissions Table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-bold text-[#1E293B]">Recent Exam Submissions</h2>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search student..." 
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 w-48"
                        />
                    </div>
                    <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-[#E2E8F0] text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-4">Student Name</th>
                            <th className="px-6 py-4">Exam</th>
                            <th className="px-6 py-4">Score</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Integrity Score</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {submissions.map((sub, i) => (
                            <tr key={sub.id} className={`hover:bg-[#F8FAFC] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                                <td className="px-6 py-4 text-sm font-medium text-[#1E293B]">{sub.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{sub.exam}</td>
                                <td className="px-6 py-4 text-sm font-bold text-[#4F46E5]">{sub.score}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase
                                        ${sub.status === 'Reviewed' ? 'bg-green-100 text-green-700' :
                                          sub.status === 'Flagged' ? 'bg-red-100 text-red-700' :
                                          'bg-yellow-100 text-yellow-700'}
                                    `}>
                                        {sub.status === 'Reviewed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                        {sub.status === 'Flagged' && <AlertCircle className="w-3 h-3 mr-1" />}
                                        {sub.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${parseInt(sub.integrity) > 90 ? 'bg-emerald-500' : parseInt(sub.integrity) > 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: sub.integrity }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-600">{sub.integrity}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-400">{sub.date}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-xs font-semibold text-slate-600 hover:text-[#4F46E5] border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-md transition-all">
                                        Review
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-[#E2E8F0] flex justify-between items-center bg-white">
                <span className="text-xs text-slate-500">Showing 1-5 of 24 submissions</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
                    <button className="px-3 py-1 border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-50">Next</button>
                </div>
            </div>
        </div>

        {/* FAB */}
        <button 
            onClick={() => onNavigate('/faculty-exams/create')}
            className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-full shadow-lg shadow-indigo-600/30 text-white flex items-center justify-center hover:scale-105 active:scale-90 transition-transform z-40 group"
            aria-label="Create New Exam"
        >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>

      </div>
    </DashboardLayout>
  );
};

// Internal Helper for the Chart
const PerformanceLineChart = () => {
    // Generate data points
    const data = [65, 68, 72, 70, 75, 74, 78, 80, 82, 85, 84, 88, 86, 90, 82];
    const width = 800;
    const height = 240;
    const padding = 20;
    
    // Scale calculations
    const maxX = data.length - 1;
    const minY = Math.min(...data) - 5;
    const maxY = Math.max(...data) + 5;
    const rangeY = maxY - minY;

    const points = data.map((d, i) => {
        const x = padding + (i / maxX) * (width - 2 * padding);
        const y = height - padding - ((d - minY) / rangeY) * (height - 2 * padding);
        return { x, y, val: d };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    
    // Area fill path
    const areaD = `${pathD} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
                <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 1, 2, 3, 4].map(i => (
                <line 
                    key={i} 
                    x1={padding} 
                    y1={padding + (i * (height - 2*padding)) / 4} 
                    x2={width - padding} 
                    y2={padding + (i * (height - 2*padding)) / 4} 
                    stroke="#F1F5F9" 
                    strokeWidth="1" 
                />
            ))}

            {/* Area */}
            <path d={areaD} fill="url(#chartFill)" />

            {/* Line */}
            <path 
                d={pathD} 
                fill="none" 
                stroke="#4F46E5" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="drop-shadow-sm"
            />

            {/* Interactive Points (Tooltips on hover) */}
            {points.map((p, i) => (
                <g key={i} className="group cursor-pointer">
                    <circle 
                        cx={p.x} cy={p.y} r="4" 
                        fill="white" stroke="#4F46E5" strokeWidth="2" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <foreignObject x={p.x - 20} y={p.y - 35} width="40" height="30" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-slate-800 text-white text-[10px] font-bold py-1 rounded-md text-center">
                            {p.val}%
                        </div>
                    </foreignObject>
                </g>
            ))}
        </svg>
    );
};
