
import React, { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { User, Exam } from '../types';
import { 
  Plus, Search, Filter, MoreHorizontal, Calendar, Users, 
  Clock, BarChart, Edit, Copy, Trash2, Eye, PlayCircle, FileText
} from 'lucide-react';

interface FacultyExamsProps {
  onNavigate: (path: string) => void;
}

export const FacultyExamsScreen: React.FC<FacultyExamsProps> = ({ onNavigate }) => {
  const facultyUser: User = {
    id: 'f1',
    name: 'Professor Smith',
    email: 'admin@sparkless.com',
    role: 'faculty'
  };

  // Mock Data with various statuses
  const [exams, setExams] = useState<Exam[]>([
    { 
      id: '1', title: 'CS302: Algorithms Final', courseName: 'Algorithms & Data Structures',
      date: 'Today, 14:00', status: 'Live', totalStudents: 45, durationMinutes: 120, type: 'Coding' 
    },
    { 
      id: '2', title: 'CS101: Midterm Exam', courseName: 'Intro to CS',
      date: 'Oct 24, 2024', status: 'Completed', totalStudents: 52, durationMinutes: 90, type: 'Mixed' 
    },
    { 
      id: '3', title: 'DS201: Data Structures Quiz', courseName: 'Data Structures',
      date: 'Dec 05, 2024', status: 'Scheduled', totalStudents: 32, durationMinutes: 45, type: 'MCQ' 
    },
    { 
      id: '4', title: 'React.js Proficiency Test', courseName: 'Frontend Engineering',
      date: 'Dec 10, 2024', status: 'Draft', totalStudents: 0, durationMinutes: 60, type: 'Coding' 
    },
  ]);

  return (
    <DashboardLayout currentUser={facultyUser} onNavigate={onNavigate} currentPath="/faculty-exams">
      <div className="max-w-7xl mx-auto pb-12 animate-slide-up">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Exam Management</h1>
                <p className="text-sm text-slate-500 mt-1">Create, schedule, and monitor your course assessments.</p>
            </div>
            <button 
                onClick={() => onNavigate('/faculty-exams/create')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95 group"
            >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                Create Smart Exam
            </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search exams by title or course..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
            </div>
            <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <Filter className="w-4 h-4" />
                    Status
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <Calendar className="w-4 h-4" />
                    Date
                </button>
            </div>
        </div>

        {/* Exam List */}
        <div className="space-y-4">
            {exams.map((exam) => (
                <div key={exam.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-md transition-all group">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Exam Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-base font-bold text-slate-900 truncate">{exam.title}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border
                                    ${exam.status === 'Live' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse' : 
                                      exam.status === 'Draft' ? 'bg-slate-100 text-slate-600 border-slate-200' : 
                                      exam.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                      'bg-amber-50 text-amber-700 border-amber-200'}
                                `}>
                                    {exam.status === 'Live' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 mb-0.5"></span>}
                                    {exam.status}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
                                    <FileText className="w-3.5 h-3.5" /> {exam.courseName}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> {typeof exam.date === 'string' ? exam.date : exam.date.toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> {exam.durationMinutes} min
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" /> {exam.totalStudents || '-'} assigned
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                            {exam.status === 'Live' && (
                                <button 
                                    onClick={() => onNavigate('/live-monitoring')}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                                >
                                    <PlayCircle className="w-4 h-4" /> Monitor Now
                                </button>
                            )}
                            
                            {exam.status === 'Draft' && (
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                                    <Edit className="w-4 h-4" /> Edit Exam
                                </button>
                            )}

                            {exam.status === 'Scheduled' && (
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors">
                                    <Eye className="w-4 h-4" /> View Details
                                </button>
                            )}

                            {exam.status === 'Completed' && (
                                <button 
                                    onClick={() => onNavigate('/exam-analytics')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm hover:bg-indigo-100 transition-colors border border-indigo-100"
                                >
                                    <BarChart className="w-4 h-4" /> Analytics
                                </button>
                            )}

                            <div className="h-8 w-px bg-slate-200 mx-1"></div>

                            <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Empty State */}
        {exams.length === 0 && (
            <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-medium">No exams found</h3>
                <p className="text-slate-500 text-sm mt-1 mb-4">Get started by creating your first smart exam.</p>
                <button 
                    onClick={() => onNavigate('/faculty-exams/create')}
                    className="text-indigo-600 font-bold text-sm hover:underline"
                >
                    Create Exam
                </button>
            </div>
        )}

      </div>
    </DashboardLayout>
  );
};