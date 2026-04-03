
import React, { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { User } from '../types';
import { useAuth } from '../services/authContext';
import { Input } from '../components/ui/Input';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { 
  User as UserIcon, Bell, Shield, Smartphone, 
  Moon, Globe, LogOut, Camera, Mail, Lock
} from 'lucide-react';

interface SettingsProps {
  onNavigate: (path: string) => void;
}

export const SettingsScreen: React.FC<SettingsProps> = ({ onNavigate }) => {
  const { user: authUser, logout } = useAuth();
  const user: User = {
    id: String(authUser?.id || ''),
    name: authUser ? `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.username : 'User',
    email: authUser?.email || '',
    role: authUser?.role === 'instructor' || authUser?.role === 'admin' ? 'faculty' : 'student'
  };

  const [notifications, setNotifications] = useState({
    emailExams: true,
    emailResults: true,
    pushReminders: true,
    pushAnnouncements: false
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    showProgress: true
  });

  return (
    <DashboardLayout currentUser={user} onNavigate={onNavigate} currentPath="/settings">
      <div className="max-w-4xl mx-auto pb-12 animate-slide-up">
        
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Account Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Navigation/Quick Profile */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Profile Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden">
                            <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-sm border-2 border-white">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-4">Student Account</p>
                    <div className="flex gap-2 w-full">
                        <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200">
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Menu */}
                <nav className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-indigo-700 bg-indigo-50 border-l-4 border-indigo-600">
                        <UserIcon className="w-4 h-4" /> Profile Information
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 border-l-4 border-transparent transition-colors">
                        <Bell className="w-4 h-4" /> Notifications
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 border-l-4 border-transparent transition-colors">
                        <Shield className="w-4 h-4" /> Security & Privacy
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 border-l-4 border-transparent transition-colors">
                        <Globe className="w-4 h-4" /> Language & Region
                    </button>
                </nav>
            </div>

            {/* Right Col: Forms */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Personal Info */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-indigo-600" /> Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Input label="Full Name" defaultValue={user.name} />
                        </div>
                        <div className="md:col-span-2">
                            <Input label="Email Address" defaultValue={user.email} leftIcon={<Mail className="w-4 h-4" />} />
                        </div>
                        <div>
                            <Input label="Student ID" defaultValue="ST-2023-8492" disabled className="bg-slate-50 text-slate-500" />
                        </div>
                        <div>
                            <Input label="Department" defaultValue="Computer Science" disabled className="bg-slate-50 text-slate-500" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button className="w-auto px-6">Save Changes</Button>
                    </div>
                </section>

                {/* Notifications */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-amber-500" /> Notifications
                    </h3>
                    <div className="space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                            <h4 className="text-sm font-bold text-slate-800 mb-4">Email Notifications</h4>
                            <div className="space-y-4">
                                <Toggle 
                                    label="Upcoming Exams" 
                                    description="Get notified 24h before an exam starts" 
                                    checked={notifications.emailExams} 
                                    onChange={(v) => setNotifications({...notifications, emailExams: v})} 
                                />
                                <Toggle 
                                    label="Exam Results" 
                                    description="Receive detailed reports when grades are published" 
                                    checked={notifications.emailResults} 
                                    onChange={(v) => setNotifications({...notifications, emailResults: v})} 
                                />
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 mb-4">Push Notifications</h4>
                            <div className="space-y-4">
                                <Toggle 
                                    label="Study Reminders" 
                                    checked={notifications.pushReminders} 
                                    onChange={(v) => setNotifications({...notifications, pushReminders: v})} 
                                />
                                <Toggle 
                                    label="Course Announcements" 
                                    checked={notifications.pushAnnouncements} 
                                    onChange={(v) => setNotifications({...notifications, pushAnnouncements: v})} 
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-emerald-600" /> Security
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div>
                                <p className="text-sm font-bold text-slate-800">Password</p>
                                <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                            </div>
                            <button className="text-xs font-bold text-indigo-600 hover:underline">Update</button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div>
                                <p className="text-sm font-bold text-slate-800">Two-Factor Authentication</p>
                                <p className="text-xs text-slate-500">Add an extra layer of security</p>
                            </div>
                            <Toggle checked={true} onChange={() => {}} />
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="bg-red-50 rounded-2xl border border-red-100 p-6 md:p-8">
                    <h3 className="text-lg font-bold text-red-700 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-600/80 mb-6">Irreversible actions regarding your account.</p>
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={() => {
                                logout();
                                onNavigate('/login');
                            }}
                            className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </section>

            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
