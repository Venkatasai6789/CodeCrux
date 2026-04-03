
import React, { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { User } from '../types';
import { useAuth } from '../services/authContext';
import { 
  FileText, Download, Search, Filter, Calendar, 
  ChevronRight, AlertTriangle, CheckCircle, BarChart2
} from 'lucide-react';

interface FacultyReportsProps {
  onNavigate: (path: string) => void;
}

export const FacultyReportsScreen: React.FC<FacultyReportsProps> = ({ onNavigate }) => {
  const { user: authUser } = useAuth();
  const facultyUser: User = { id: String(authUser?.id || ''), name: authUser ? `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.username : 'Faculty', email: authUser?.email || '', role: 'faculty' };

  const reports = [
    { id: 1, name: 'CS101 Midterm Analysis', type: 'Exam Report', date: 'Oct 25, 2024', status: 'Ready', size: '2.4 MB' },
    { id: 2, name: 'Student Integrity Summary - Q3', type: 'Proctoring', date: 'Oct 20, 2024', status: 'Ready', size: '1.1 MB' },
    { id: 3, name: 'Course Completion Stats', type: 'Performance', date: 'Oct 15, 2024', status: 'Processing', size: '--' },
    { id: 4, name: 'CS302 Algorithm Final', type: 'Exam Report', date: 'Nov 12, 2024', status: 'Ready', size: '3.5 MB' },
  ];

  return (
    <DashboardLayout currentUser={facultyUser} onNavigate={onNavigate} currentPath="/reports">
      <div className="max-w-7xl mx-auto pb-12 animate-slide-up">
        
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Reports Center</h1>
            <p className="text-sm text-slate-500 mt-1">Access detailed analytics and downloadable reports.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('/exam-analytics')}>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                    <BarChart2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Exam Analytics</h3>
                <p className="text-xs text-slate-500">View detailed breakdown of exam performance.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('/faculty-disputes')}>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Disputes & Appeals</h3>
                <p className="text-xs text-slate-500">Manage student grade challenges.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('/students')}>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Student Records</h3>
                <p className="text-xs text-slate-500">Access individual student progress reports.</p>
            </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-slate-900">Generated Reports</h3>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                    <tr>
                        <th className="px-6 py-4">Report Name</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Date Generated</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded text-slate-500">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{report.name}</p>
                                        <p className="text-xs text-slate-500">{report.size}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{report.type}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{report.date}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    report.status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {report.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1 justify-end ml-auto">
                                    <Download className="w-3.5 h-3.5" /> Download
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

      </div>
    </DashboardLayout>
  );
};
