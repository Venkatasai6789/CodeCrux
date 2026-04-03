
import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { User } from '../types';
import { useAuth } from '../services/authContext';
import { usersAPI } from '../services/apiService';
import { 
  Search, Plus, Upload, MessageSquare, ChevronDown, 
  MoreHorizontal, Mail, Edit, Trash2, X, Check, ArrowUpDown,
  User as UserIcon, BookOpen, TrendingUp, Clock, Calendar,
  GraduationCap, Send, Loader2
} from 'lucide-react';

interface StudentManagementProps {
  onNavigate: (path: string) => void;
}

// --- Types ---
interface Student {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Pending';
  courses: string[];
  performance: number; // 0-100
  grade: string; // Overall
  lastActive: string;
  enrollmentDate: string;
  avatar: string;
}

// Data fetched from API — no mock data

export const StudentManagementScreen: React.FC<StudentManagementProps> = ({ onNavigate }) => {
  const { user: authUser } = useAuth();
  const facultyUser: User = {
    id: String(authUser?.id || ''),
    name: authUser ? `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.username : 'Faculty',
    email: authUser?.email || '',
    role: 'faculty',
  };

  // Data from API
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeProfile, setActiveProfile] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState<'All' | 'Active' | 'Inactive' | 'Pending'>('All');
  const [profileTab, setProfileTab] = useState<'Overview' | 'Courses' | 'Performance' | 'Communications'>('Overview');

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const data = await usersAPI.getStudents();
        setStudentsData(data || []);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Filtering Logic
  const filteredStudents = useMemo(() => {
    return studentsData.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSegment = activeSegment === 'All' ? true : s.status === activeSegment;
      return matchesSearch && matchesSegment;
    });
  }, [searchQuery, activeSegment, studentsData]);

  // Selection Handlers
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredStudents.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredStudents.map(s => s.id)));
  };

  // Helper Colors
  const getStatusColor = (status: string) => {
    switch(status) {
        case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'Inactive': return 'bg-slate-100 text-slate-600 border-slate-200';
        case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
        default: return 'bg-slate-100';
    }
  };

  const getGradeColor = (grade: string) => {
      if (grade.startsWith('A')) return 'text-emerald-600';
      if (grade.startsWith('B')) return 'text-indigo-600';
      if (grade.startsWith('C')) return 'text-amber-600';
      if (grade.startsWith('F')) return 'text-red-600';
      return 'text-slate-400';
  };

  return (
    <DashboardLayout currentUser={facultyUser} onNavigate={onNavigate} currentPath="/students">
      <div className="flex flex-col h-[calc(100vh-6rem)] -m-4 md:-m-8">
        
        {/* Top Control Bar */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
            <h1 className="text-xl font-bold text-slate-800">Student Management</h1>
            <div className="flex gap-3">
                <button 
                    disabled={selectedIds.size === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <MessageSquare className="w-4 h-4" />
                    Message Selected
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    Import CSV
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg text-sm font-bold hover:shadow-md transition-all active:scale-95">
                    <Plus className="w-4 h-4" />
                    Add Student
                </button>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
            
            {/* Left Column - Filters */}
            <aside className="w-72 bg-[#FAFAFA] border-r border-slate-200 flex flex-col overflow-y-auto shrink-0 hidden md:flex">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search students..." 
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    {/* Segments */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 px-2">Segments</h3>
                        <div className="space-y-1">
                            {[
                                { id: 'All', label: 'All Students', count: studentsData.length },
                                { id: 'Active', label: 'Active', count: studentsData.filter(s => s.status === 'Active').length },
                                { id: 'Inactive', label: 'Inactive', count: studentsData.filter(s => s.status === 'Inactive').length },
                                { id: 'Pending', label: 'Pending Approval', count: studentsData.filter(s => s.status === 'Pending').length },
                            ].map(seg => (
                                <button
                                    key={seg.id}
                                    onClick={() => setActiveSegment(seg.id as any)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSegment === seg.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <span>{seg.label}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeSegment === seg.id ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-500'}`}>{seg.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Additional Filters */}
                    <div>
                        <div className="flex justify-between items-center mb-3 px-2">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Filters</h3>
                            <button className="text-[10px] text-indigo-600 hover:underline">Clear all</button>
                        </div>
                        
                        <div className="space-y-4 px-2">
                            <div>
                                <label className="text-xs font-medium text-slate-700 mb-2 block">Enrollment Status</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" defaultChecked />
                                        <span className="text-sm text-slate-600">Enrolled</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                                        <span className="text-sm text-slate-600">Not Enrolled</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-700 mb-2 block">Performance</label>
                                <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                    <span>Low</span>
                                    <span>High</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Right Column - Table */}
            <div className="flex-1 overflow-y-auto bg-white relative">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 w-12">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                    checked={selectedIds.size === filteredStudents.length && filteredStudents.length > 0}
                                    onChange={toggleAll}
                                />
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group">
                                <div className="flex items-center gap-1">Name <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" /></div>
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Email</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Courses</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Performance</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Last Active</th>
                            <th className="px-6 py-4 w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map((student) => {
                            const isSelected = selectedIds.has(student.id);
                            return (
                                <tr 
                                    key={student.id} 
                                    onClick={() => setActiveProfile(student)}
                                    className={`
                                        cursor-pointer transition-colors hover:bg-slate-50
                                        ${isSelected ? 'bg-indigo-50/50 hover:bg-indigo-50' : ''}
                                        ${activeProfile?.id === student.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}
                                    `}
                                >
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                            checked={isSelected}
                                            onChange={() => toggleSelection(student.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full bg-slate-200" />
                                            <span className="text-sm font-medium text-slate-900">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell">{student.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 hidden xl:table-cell">
                                        <div className="flex gap-1 flex-wrap">
                                            {student.courses.slice(0, 2).map(c => (
                                                <span key={c} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] border border-slate-200">{c}</span>
                                            ))}
                                            {student.courses.length > 2 && (
                                                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-500 border border-slate-200">+{student.courses.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={`text-sm font-bold ${getGradeColor(student.grade)}`}>{student.grade}</span>
                                            <span className="text-[10px] text-slate-400">{student.performance}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell">{student.lastActive}</td>
                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <button className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                
                {/* Empty State */}
                {filteredStudents.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-medium">No students found</h3>
                        <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>

            {/* Profile Slide-over Panel */}
            <div 
                className={`
                    absolute top-0 bottom-0 right-0 w-[450px] bg-white border-l border-slate-200 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out flex flex-col
                    ${activeProfile ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {activeProfile && (
                    <>
                        {/* Panel Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full border-4 border-white shadow-sm overflow-hidden">
                                    <img src={activeProfile.avatar} alt={activeProfile.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 leading-tight">{activeProfile.name}</h2>
                                    <p className="text-sm text-slate-500">{activeProfile.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">ID: {activeProfile.id.padStart(6, '0')}</span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(activeProfile.status)}`}>
                                            {activeProfile.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setActiveProfile(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Profile Tabs */}
                        <div className="flex border-b border-slate-100 px-4 bg-white">
                            {['Overview', 'Courses', 'Performance', 'Communications'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setProfileTab(tab as any)}
                                    className={`
                                        flex-1 py-4 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors
                                        ${profileTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'}
                                    `}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Profile Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30">
                            
                            {/* OVERVIEW TAB */}
                            {profileTab === 'Overview' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                            <div className="text-slate-500 text-xs mb-2 flex items-center gap-1 font-bold uppercase tracking-wider"><Calendar className="w-3.5 h-3.5" /> Enrolled On</div>
                                            <div className="text-sm font-bold text-slate-900">{activeProfile.enrollmentDate}</div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                            <div className="text-slate-500 text-xs mb-2 flex items-center gap-1 font-bold uppercase tracking-wider"><BookOpen className="w-3.5 h-3.5" /> Courses</div>
                                            <div className="text-sm font-bold text-slate-900">{activeProfile.courses.length} Active</div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="text-sm font-bold text-slate-800 mb-4">Quick Actions</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button className="flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100">
                                                <Mail className="w-3.5 h-3.5" /> Send Message
                                            </button>
                                            <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
                                                <Edit className="w-3.5 h-3.5" /> Edit Profile
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5" /> Recent Activity
                                        </h4>
                                        <div className="space-y-0 relative">
                                            <div className="absolute top-2 bottom-2 left-3 w-px bg-slate-200"></div>
                                            {[
                                                { text: 'Completed module "React Hooks"', time: '2 hours ago', icon: Check },
                                                { text: 'Submitted assignment "Algorithm Analysis"', time: 'Yesterday', icon: Upload },
                                                { text: 'Logged in', time: activeProfile.lastActive, icon: UserIcon }
                                            ].map((activity, i) => (
                                                <div key={i} className="flex gap-4 items-start relative pb-6 last:pb-0">
                                                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 z-10">
                                                        <activity.icon className="w-3 h-3 text-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-800 font-medium leading-tight">{activity.text}</p>
                                                        <p className="text-[10px] text-slate-400 mt-1">{activity.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* COURSES TAB */}
                            {profileTab === 'Courses' && (
                                <div className="space-y-4">
                                    {activeProfile.courses.map((course) => {
                                        const gradeColor = activeProfile.grade.startsWith('A') ? 'text-emerald-600' : activeProfile.grade.startsWith('B') ? 'text-indigo-600' : activeProfile.grade.startsWith('C') ? 'text-amber-600' : 'text-slate-400';
                                        return (
                                            <div key={course} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-indigo-200 transition-all">
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 mb-1">{course}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase border border-blue-100">In Progress</span>
                                                        <span className="text-[10px] text-slate-400">Enrolled Sep 12</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className={`text-sm font-bold ${gradeColor}`}>{activeProfile.grade}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">Current Grade</p>
                                                    </div>
                                                    <button 
                                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Remove from course"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    <button className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold text-xs hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2">
                                        <Plus className="w-4 h-4" /> Enroll in New Course
                                    </button>
                                </div>
                            )}

                            {/* PERFORMANCE TAB */}
                            {profileTab === 'Performance' && (
                                <div>
                                    <div className="flex items-center justify-between bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-xl shadow-lg mb-8 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><GraduationCap className="w-24 h-24" /></div>
                                        <div className="relative z-10">
                                            <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider mb-1">Overall GPA</p>
                                            <p className="text-4xl font-bold">3.8</p>
                                        </div>
                                        <div className="h-12 w-px bg-white/20 relative z-10"></div>
                                        <div className="relative z-10 text-right">
                                            <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider mb-1">Avg Score</p>
                                            <p className="text-4xl font-bold">{activeProfile.performance}%</p>
                                        </div>
                                    </div>
                                    
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-3.5 h-3.5" /> Detailed Breakdown
                                    </h4>
                                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                                                <tr>
                                                    <th className="px-4 py-3">Course</th>
                                                    <th className="px-4 py-3 text-right">Grade</th>
                                                    <th className="px-4 py-3 text-right">Score</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {activeProfile.courses.map((c) => {
                                                    const gColor = activeProfile.grade.startsWith('A') ? 'text-emerald-600' : activeProfile.grade.startsWith('B') ? 'text-indigo-600' : activeProfile.grade.startsWith('C') ? 'text-amber-600' : 'text-slate-400';
                                                    return (
                                                        <tr key={c} className="hover:bg-slate-50">
                                                            <td className="px-4 py-3 font-medium text-slate-800">{c}</td>
                                                            <td className={`px-4 py-3 text-right font-bold ${gColor}`}>{activeProfile.grade}</td>
                                                            <td className="px-4 py-3 text-right text-slate-500 font-mono">{activeProfile.performance}%</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* COMMUNICATIONS TAB */}
                            {profileTab === 'Communications' && (
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 space-y-6 mb-4">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 border border-indigo-200">P</div>
                                            <div className="max-w-[85%]">
                                                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                                    <p className="text-sm text-slate-700 leading-relaxed">Please make sure to submit your assignment by Friday. The deadline is strict this time.</p>
                                                </div>
                                                <span className="text-[10px] text-slate-400 mt-1 block ml-1">Yesterday 2:30 PM</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-3 flex-row-reverse">
                                            <img src={activeProfile.avatar} className="w-8 h-8 rounded-full shrink-0 border border-slate-200" alt="Student" />
                                            <div className="max-w-[85%]">
                                                <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none shadow-md">
                                                    <p className="text-sm leading-relaxed">Understood, professor. I'm almost done with the implementation, just debugging a few edge cases.</p>
                                                </div>
                                                <span className="text-[10px] text-slate-400 mt-1 block text-right mr-1">Yesterday 2:45 PM</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="relative mt-auto pt-4 border-t border-slate-200">
                                        <input 
                                            type="text" 
                                            placeholder="Type a message..." 
                                            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 shadow-sm transition-all"
                                        />
                                        <button className="absolute right-2 top-1/2 -translate-y-1/2 mt-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

        </div>

        {/* Sticky Bottom Actions Bar */}
        <div className={`
            fixed bottom-0 left-0 right-0 h-16 bg-[#1e293b] text-white flex items-center justify-between px-8 z-40 transition-transform duration-300 md:pl-64
            ${selectedIds.size > 0 ? 'translate-y-0' : 'translate-y-full'}
        `}>
            <div className="flex items-center gap-4">
                <div className="bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {selectedIds.size}
                </div>
                <span className="text-sm font-medium">Students Selected</span>
            </div>
            <div className="flex items-center gap-3">
                <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors">
                    Update Status
                </button>
                <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors">
                    Send Message
                </button>
                <div className="h-6 w-px bg-white/20 mx-2"></div>
                <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-colors flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete
                </button>
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
