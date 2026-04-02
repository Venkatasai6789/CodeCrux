
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, AlertTriangle, CheckCircle2, 
  Clock, X, Unlock, Ban, Users, MoreHorizontal,
  ArrowUpDown, FileText, Download, FileSpreadsheet, 
  FileWarning, Mail, Pause, Power, Wifi, WifiOff, Eye,
  ChevronDown
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface LiveMonitoringProps {
  onNavigate: (path: string) => void;
}

// --- Types ---
type StudentStatus = 'writing' | 'completed' | 'not_started' | 'blocked';

interface Student {
  id: string;
  studentId: string;
  name: string;
  avatar: string;
  status: StudentStatus;
  timeRemaining: string;
  blockReason?: string;
  blockTimestamp?: string;
  completedAt?: string;
  progress: number;
  score?: number; // 0-100
  grade?: string; // A, B, etc.
  isOnline: boolean;
}

// --- Mock Data ---
const MOCK_STUDENTS: Student[] = [
  { 
    id: '1', studentId: 'ST-0001', name: 'Alex Johnson', avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=0D8ABC&color=fff',
    status: 'writing', timeRemaining: '45m 12s', progress: 65, isOnline: true 
  },
  { 
    id: '2', studentId: 'ST-0002', name: 'Maria Garcia', avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=E11D48&color=fff',
    status: 'blocked', timeRemaining: 'Paused', blockReason: 'Multiple Faces Detected', blockTimestamp: '10:45 AM', progress: 42, isOnline: true 
  },
  { 
    id: '3', studentId: 'ST-0003', name: 'James Wilson', avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=D97706&color=fff',
    status: 'blocked', timeRemaining: 'Paused', blockReason: 'Phone Detected (98% conf.)', blockTimestamp: '10:12 AM', progress: 30, isOnline: false 
  },
  { 
    id: '4', studentId: 'ST-0004', name: 'Sarah Chen', avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=059669&color=fff',
    status: 'writing', timeRemaining: '42m 05s', progress: 78, isOnline: true 
  },
  { 
    id: '5', studentId: 'ST-0005', name: 'Michael Brown', avatar: 'https://ui-avatars.com/api/?name=Michael+Brown&background=475569&color=fff',
    status: 'not_started', timeRemaining: '60m 00s', progress: 0, isOnline: false 
  },
  { 
    id: '6', studentId: 'ST-0006', name: 'Emma Davis', avatar: 'https://ui-avatars.com/api/?name=Emma+Davis&background=7C3AED&color=fff',
    status: 'completed', timeRemaining: '-', completedAt: '10m ago', progress: 100, score: 92, grade: 'A', isOnline: true 
  },
  { 
    id: '7', studentId: 'ST-0007', name: 'David Lee', avatar: 'https://ui-avatars.com/api/?name=David+Lee&background=2563EB&color=fff',
    status: 'writing', timeRemaining: '55m 20s', progress: 20, isOnline: true 
  },
  { 
    id: '8', studentId: 'ST-0008', name: 'Lucas Miller', avatar: 'https://ui-avatars.com/api/?name=Lucas+Miller&background=DB2777&color=fff',
    status: 'completed', timeRemaining: '-', completedAt: '15m ago', progress: 100, score: 78, grade: 'C+', isOnline: false 
  },
  { 
    id: '9', studentId: 'ST-0009', name: 'Olivia Martinez', avatar: 'https://ui-avatars.com/api/?name=Olivia+Martinez&background=DC2626&color=fff',
    status: 'blocked', timeRemaining: 'Paused', blockReason: 'Gaze Aversion > 15s', blockTimestamp: '11:05 AM', progress: 55, isOnline: true 
  },
  { 
    id: '10', studentId: 'ST-0010', name: 'William Taylor', avatar: 'https://ui-avatars.com/api/?name=William+Taylor&background=0891B2&color=fff',
    status: 'completed', timeRemaining: '-', completedAt: '2m ago', progress: 100, score: 85, grade: 'B', isOnline: true 
  },
];

export const LiveMonitoringScreen: React.FC<LiveMonitoringProps> = ({ onNavigate }) => {
  // --- State ---
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // UI State
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Modal State
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [unblockReason, setUnblockReason] = useState('');

  // Refs for click outside
  const exportRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
      // Note: Row menus handle their own outside click via a backdrop usually, 
      // but for simple dropdowns we can check here too.
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Derived Data ---
  const stats = useMemo(() => ({
    total: students.length,
    writing: students.filter(s => s.status === 'writing').length,
    blocked: students.filter(s => s.status === 'blocked').length,
    completed: students.filter(s => s.status === 'completed').length,
    not_started: students.filter(s => s.status === 'not_started').length,
  }), [students]);

  const filteredList = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || s.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [students, searchQuery, filterStatus]);

  // --- Handlers ---
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredList.map(s => s.id)));
    }
  };

  const handleUnblockClick = (student: Student) => {
    setSelectedStudent(student);
    setUnblockReason('');
    setUnblockModalOpen(true);
  };

  const confirmUnblock = () => {
    if (!selectedStudent || !unblockReason.trim()) return;
    setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, status: 'writing', blockReason: undefined } : s));
    setUnblockModalOpen(false);
    setSelectedStudent(null);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on ${selectedIds.size} students`);
    // Mock action
    setSelectedIds(new Set());
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans flex flex-col relative" onClick={() => setOpenMenuId(null)}>
      
      {/* 1. Header */}
      <header className="h-16 bg-[#1E293B] border-b border-slate-700/50 flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-indigo-500">CS302</span>
            <span className="text-slate-600">/</span>
            Algorithms Final
          </h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Live
          </span>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => onNavigate('/faculty-dashboard')} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-[1600px] mx-auto w-full relative">
        
        {/* 2. Heads-Up Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatsCard label="Total Assigned" value={stats.total} icon={Users} color="text-slate-200" bg="bg-slate-800" />
            <StatsCard label="Attempting" value={stats.writing} icon={FileText} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
            <StatsCard label="Not Started" value={stats.not_started} icon={Clock} color="text-slate-400" bg="bg-slate-800" />
            <StatsCard label="Blocked" value={stats.blocked} icon={AlertTriangle} color="text-red-400" bg="bg-red-500/10" border="border-red-500/20" alert={stats.blocked > 0} />
            <StatsCard label="Completed" value={stats.completed} icon={CheckCircle2} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
        </div>

        {/* 3. Controls Toolbar */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 bg-[#1E293B] p-4 rounded-xl border border-slate-700/50 shadow-sm sticky top-0 z-30">
            <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search by name or ID..." 
                        className="w-full bg-[#0F172A] border border-slate-700 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                    {['all', 'writing', 'blocked', 'completed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`
                                px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all whitespace-nowrap
                                ${filterStatus === status 
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                                    : 'bg-[#0F172A] border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                            `}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Export Dropdown */}
            <div className="relative ml-auto xl:ml-0" ref={exportRef}>
                <button 
                    onClick={() => setIsExportOpen(!isExportOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 font-bold text-sm transition-colors shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    Export Data
                    <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
                </button>

                {isExportOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                        <div className="p-2 space-y-1">
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 rounded-lg text-left transition-colors group">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-200">Exam Summary</p>
                                    <p className="text-[10px] text-slate-500">PDF • Visual report</p>
                                </div>
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 rounded-lg text-left transition-colors group">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300">
                                    <FileSpreadsheet className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-200">Gradebook</p>
                                    <p className="text-[10px] text-slate-500">CSV • Raw scores</p>
                                </div>
                            </button>
                            <div className="h-px bg-slate-700/50 my-1"></div>
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 rounded-lg text-left transition-colors group">
                                <div className="p-2 bg-red-500/10 rounded-lg text-red-400 group-hover:bg-red-500/20 group-hover:text-red-300">
                                    <FileWarning className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-200">Malpractice Log</p>
                                    <p className="text-[10px] text-slate-500">PDF • Audit trail</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* 4. Main Data Grid */}
        
        {/* DESKTOP VIEW: Table */}
        <div className="hidden md:block bg-[#1E293B] rounded-xl border border-slate-700/50 overflow-visible shadow-lg relative">
            <table className="w-full text-left border-collapse">
                <thead className="bg-[#0F172A] text-xs uppercase font-bold text-slate-500 border-b border-slate-700 sticky top-0 z-20 shadow-sm">
                    <tr>
                        <th className="px-6 py-4 w-12">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                checked={selectedIds.size === filteredList.length && filteredList.length > 0}
                                onChange={toggleAll}
                            />
                        </th>
                        <th className="px-6 py-4 w-[25%] cursor-pointer hover:text-slate-300 group transition-colors">
                            <div className="flex items-center gap-1">Student Identity <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" /></div>
                        </th>
                        <th className="px-6 py-4 w-[20%]">Status</th>
                        <th className="px-6 py-4 w-[20%]">Progress / Result</th>
                        <th className="px-6 py-4 w-[20%] text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                    {filteredList.map((student) => {
                        const isSelected = selectedIds.has(student.id);
                        return (
                            <tr key={student.id} className={`transition-colors ${isSelected ? 'bg-indigo-900/20' : 'hover:bg-slate-800/30'}`}>
                                <td className="px-6 py-4">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        checked={isSelected}
                                        onChange={() => toggleSelection(student.id)}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700" />
                                            {/* Connectivity Dot */}
                                            <div 
                                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1E293B] ${student.isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`}
                                                title={student.isOnline ? "Online" : "Offline"}
                                            ></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{student.name}</p>
                                            <p className="text-xs font-mono text-slate-500">{student.studentId}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col items-start gap-1">
                                        {student.status === 'writing' && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                </span>
                                                Attempting
                                            </span>
                                        )}
                                        {student.status === 'blocked' && (
                                            <div className="group relative">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 cursor-help">
                                                    <Ban className="w-3 h-3" /> Blocked
                                                </span>
                                                <p className="text-[10px] text-red-400 font-medium mt-1 truncate max-w-[140px]">{student.blockReason}</p>
                                                
                                                {/* Tooltip */}
                                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-50 shadow-xl">
                                                    Detected at {student.blockTimestamp}
                                                </div>
                                            </div>
                                        )}
                                        {student.status === 'completed' && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                <CheckCircle2 className="w-3 h-3" /> Finished
                                            </span>
                                        )}
                                        {student.status === 'not_started' && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700/50 text-slate-400 border border-slate-700">
                                                Not Started
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {student.status === 'completed' ? (
                                        <div>
                                            <div className="text-sm font-bold text-white flex items-center gap-2">
                                                {student.score !== undefined ? `${student.score}/100` : 'Pending'}
                                                {student.grade && <span className={`text-xs px-1.5 py-0.5 rounded ${student.grade.startsWith('A') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>{student.grade}</span>}
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Submitted {student.completedAt}</p>
                                        </div>
                                    ) : (
                                        <div className="w-full max-w-[140px]">
                                            <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                                                <span>{student.timeRemaining}</span>
                                                <span>{student.progress}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${student.status === 'blocked' ? 'bg-red-500' : 'bg-indigo-500'}`} 
                                                    style={{ width: `${student.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {student.status === 'blocked' ? (
                                            <button 
                                                onClick={() => handleUnblockClick(student)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                                            >
                                                <Unlock className="w-3.5 h-3.5" /> Unblock
                                            </button>
                                        ) : student.status === 'completed' ? (
                                            <button className="px-3 py-1.5 bg-slate-800 text-indigo-400 hover:bg-slate-700 hover:text-indigo-300 text-xs font-bold rounded-lg border border-slate-700 transition-colors">
                                                View Report
                                            </button>
                                        ) : (
                                            <button className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 transition-colors">
                                                Details
                                            </button>
                                        )}
                                        
                                        {/* Row Menu (3 Dots) */}
                                        <div className="relative" ref={openMenuId === student.id ? menuRef : null}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === student.id ? null : student.id); }}
                                                className={`p-1.5 rounded-lg transition-colors ${openMenuId === student.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                            
                                            {/* Dropdown */}
                                            {openMenuId === student.id && (
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl z-50 animate-fade-in overflow-hidden">
                                                    <div className="p-1 space-y-0.5">
                                                        <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-left">
                                                            <FileText className="w-3.5 h-3.5 text-indigo-400" /> View Audit Log
                                                        </button>
                                                        <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-left">
                                                            <Mail className="w-3.5 h-3.5 text-emerald-400" /> Message Student
                                                        </button>
                                                        <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-left">
                                                            <Pause className="w-3.5 h-3.5 text-amber-400" /> Pause Timer
                                                        </button>
                                                        <div className="h-px bg-slate-700/50 my-1"></div>
                                                        <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors text-left">
                                                            <Power className="w-3.5 h-3.5" /> Force Submit
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {filteredList.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                    No students found matching your criteria.
                </div>
            )}
        </div>

        {/* MOBILE VIEW: Cards */}
        <div className="md:hidden space-y-4 pb-20">
            {filteredList.map((student) => (
                <div key={student.id} className={`bg-[#1E293B] border rounded-xl p-5 shadow-sm ${selectedIds.has(student.id) ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-700'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                                checked={selectedIds.has(student.id)}
                                onChange={() => toggleSelection(student.id)}
                            />
                            <div className="relative">
                                <img src={student.avatar} alt="" className="w-10 h-10 rounded-full" />
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1E293B] ${student.isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-base">{student.name}</h3>
                                <p className="text-xs font-mono text-slate-500">{student.studentId}</p>
                            </div>
                        </div>
                        <button className="text-slate-400" onClick={() => setOpenMenuId(student.id)}>
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {/* Block Banner */}
                    {student.blockReason && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-red-400 font-bold uppercase">Blocked: {student.blockReason}</p>
                                <p className="text-[10px] text-red-300 mt-0.5">Detected at {student.blockTimestamp}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pb-4 border-b border-slate-700">
                        {student.status === 'completed' ? (
                            <div className="flex items-center gap-2 text-white font-bold">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Score: {student.score}%
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> {student.timeRemaining}
                            </div>
                        )}
                        <div>Progress: {student.progress}%</div>
                    </div>

                    <div className="flex gap-3">
                        {student.status === 'blocked' ? (
                            <button 
                                onClick={() => handleUnblockClick(student)}
                                className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Unlock className="w-4 h-4" /> Unblock Student
                            </button>
                        ) : student.status === 'completed' ? (
                            <button className="flex-1 py-3 bg-slate-700 text-indigo-300 font-bold rounded-lg text-sm">
                                View Report
                            </button>
                        ) : (
                            <button className="flex-1 py-3 bg-slate-700 text-slate-300 font-bold rounded-lg text-sm hover:bg-slate-600 transition-colors">
                                View Details
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>

      </div>

      {/* 5. Unblock Modal */}
      {unblockModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#1E293B] w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-slide-up">
                  <div className="p-6 border-b border-slate-700 bg-slate-800/50">
                      <div className="flex items-center gap-3 mb-1">
                          <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500">
                              <Unlock className="w-6 h-6" />
                          </div>
                          <h2 className="text-xl font-bold text-white">Unblock Student</h2>
                      </div>
                      <p className="text-sm text-slate-400 ml-11">Restore access for <span className="text-white font-bold">{selectedStudent.name}</span></p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                          <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1">AI Flag Reason</p>
                          <p className="text-sm text-red-100 font-medium">{selectedStudent.blockReason}</p>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-300 mb-2">Reason for Unblocking <span className="text-red-500">*</span></label>
                          <p className="text-xs text-slate-500 mb-3">Please provide a justification for auditing purposes.</p>
                          <textarea 
                              value={unblockReason}
                              onChange={(e) => setUnblockReason(e.target.value)}
                              className="w-full h-32 bg-[#0F172A] border border-slate-600 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none placeholder:text-slate-600"
                              placeholder="E.g., Verified environment via secondary camera..."
                              autoFocus
                          />
                      </div>
                  </div>

                  <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-end gap-3">
                      <Button variant="secondary" onClick={() => setUnblockModalOpen(false)} className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600">
                          Cancel
                      </Button>
                      <button 
                          onClick={confirmUnblock}
                          disabled={!unblockReason.trim()}
                          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-900/20"
                      >
                          Confirm Unblock
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* 6. Bulk Action Bar (Floating) */}
      {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up w-[90%] max-w-2xl">
              <div className="bg-indigo-600 text-white p-3 rounded-xl shadow-2xl shadow-indigo-900/50 flex items-center justify-between border border-indigo-500/50">
                  <div className="flex items-center gap-4 pl-2">
                      <div className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold">
                          {selectedIds.size} Selected
                      </div>
                      <button onClick={toggleAll} className="text-xs text-indigo-100 hover:text-white underline">
                          Deselect All
                      </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleBulkAction('message')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                      >
                          <Mail className="w-4 h-4" /> Message
                      </button>
                      <div className="h-4 w-px bg-white/20"></div>
                      <button 
                        onClick={() => handleBulkAction('unblock')}
                        className="p-2 hover:bg-emerald-500/20 hover:text-emerald-200 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                      >
                          <Unlock className="w-4 h-4" /> Unblock
                      </button>
                      <div className="h-4 w-px bg-white/20"></div>
                      <button 
                        onClick={() => handleBulkAction('pause')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                      >
                          <Pause className="w-4 h-4" /> Pause
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

// Component: Stats Card
const StatsCard = ({ label, value, icon: Icon, color, bg, border = 'border-slate-700', alert = false }: any) => (
    <div className={`p-4 rounded-xl border ${border} ${bg} flex flex-col justify-between h-24 relative overflow-hidden group`}>
        {alert && (
            <div className="absolute top-0 right-0 p-1">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </div>
        )}
        <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</span>
            <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
);
