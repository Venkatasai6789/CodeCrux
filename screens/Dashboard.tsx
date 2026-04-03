
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { ActiveCourseCard } from '../components/Dashboard/ActiveCourseCard';
import { CourseCard } from '../components/Dashboard/CourseCard';
import { ExamCard } from '../components/Dashboard/ExamCard';
import { LearningChart } from '../components/Dashboard/LearningChart';
import { XPWidget } from '../components/Dashboard/XPWidget';
import { CreateCourseModal } from '../components/Dashboard/CreateCourseModal';
import { DeleteConfirmationModal } from '../components/Dashboard/DeleteConfirmationModal';
import { Plus, ArrowUpRight, Target, MessageSquare, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { User, Course, Exam } from '../types';
import { useAuth } from '../services/authContext';
import { coursesAPI, examsAPI } from '../services/apiService';

interface DashboardProps {
  onNavigate: (path: string) => void;
}

export const DashboardScreen: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user: authUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Real data from API
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeCourse, setActiveCourse] = useState<any>(null);

  // Delete State
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Map auth user to the User type the layout expects
  const user: User = {
    id: String(authUser?.id || ''),
    name: authUser ? `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.username : 'Student',
    email: authUser?.email || '',
    role: authUser?.role === 'instructor' || authUser?.role === 'admin' ? 'faculty' : 'student',
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch enrolled courses
        const courseData = await coursesAPI.myCourses();
        const mappedCourses: Course[] = (Array.isArray(courseData) ? courseData : courseData?.results || []).map((enrollment: any) => ({
          id: String(enrollment.course),
          title: enrollment.course_title,
          instructor: enrollment.instructor_name || 'Instructor',
          progress: enrollment.progress || 0,
          completedLessons: enrollment.completed_lessons || 0,
          totalLessons: enrollment.course_total_lessons || 10,
          thumbnail: enrollment.course_thumbnail || `https://picsum.photos/seed/${enrollment.course}/400/225`,
          difficulty: (enrollment.course_difficulty || 'beginner').charAt(0).toUpperCase() + (enrollment.course_difficulty || 'beginner').slice(1) as any,
          category: (enrollment.course_category || 'general').charAt(0).toUpperCase() + (enrollment.course_category || 'general').slice(1),
        }));
        setCourses(mappedCourses);

        // Set active course (highest progress, not 100%)
        if (mappedCourses.length > 0) {
          const active = mappedCourses
            .filter(c => c.progress < 100)
            .sort((a, b) => b.progress - a.progress)[0] || mappedCourses[0];
          setActiveCourse(active);
        }

        // Fetch upcoming exams
        const examStats = await examsAPI.getDashboardStats();
        const upcomingExams = (examStats?.upcoming_exams || []).map((ex: any) => ({
          id: String(ex.id),
          title: ex.title,
          date: new Date(ex.start_time),
          durationMinutes: ex.duration_minutes,
          status: 'Scheduled' as const,
        }));
        setExams(upcomingExams);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddCourse = (newCourse: Course) => {
    setCourses(prev => [newCourse, ...prev]);
  };

  const handleDeleteClick = (id: string) => {
    const course = courses.find(c => c.id === id);
    if (course) setCourseToDelete(course);
  };

  const handleConfirmDelete = () => {
    if (courseToDelete) {
      setCourses(prev => prev.filter(c => c.id !== courseToDelete.id));
      setCourseToDelete(null);
    }
  };

  // Get unique categories from actual course data
  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category || 'General')))];

  const filteredCourses = selectedFilter === 'All'
    ? courses
    : courses.filter(course => (course.category || 'General').toLowerCase().includes(selectedFilter.toLowerCase()));

  if (isLoading) {
    return (
      <DashboardLayout currentUser={user} onNavigate={onNavigate}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentUser={user} onNavigate={onNavigate}>
      <div className="animate-slide-up pb-24">

        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    Hello, {user.name.split(' ')[0]} <span className="animate-wave text-3xl">👋</span>
                </h1>
                <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
                    Nice to have you back! Get ready to continue your learning journey.
                    {exams.length > 0 && (
                      <> You have <span className="font-semibold text-primary">{exams.length} exams</span> upcoming.</>
                    )}
                </p>
            </div>
            <div className="hidden md:block">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 text-right">Current Date</span>
                <span className="text-sm font-bold text-slate-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
            </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

            {/* Left Column (Main Content) */}
            <div className="xl:col-span-8 flex flex-col gap-8">

                {/* Active Course (Hero) */}
                {activeCourse && (
                  <section>
                     <ActiveCourseCard
                        title={activeCourse.title}
                        progress={activeCourse.progress}
                        totalLessons={activeCourse.totalLessons}
                        completedLessons={activeCourse.completedLessons}
                        timeLeft="50 min"
                        students={0}
                        image={activeCourse.thumbnail}
                     />
                  </section>
                )}

                {/* Your Courses */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                         <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Your Courses <span className="text-slate-400 text-sm font-normal">({courses.length})</span>
                         </h2>

                         {/* Filter Tabs — dynamic from actual categories */}
                         <div className="flex p-1 bg-slate-100/80 rounded-xl overflow-x-auto no-scrollbar">
                            {categories.map(option => (
                                <button
                                    key={option}
                                    onClick={() => setSelectedFilter(option)}
                                    className={`
                                        px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap
                                        ${selectedFilter === option
                                            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                                    `}
                                >
                                    {option}
                                </button>
                            ))}
                         </div>
                    </div>

                    {filteredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {filteredCourses.map(course => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    onDelete={handleDeleteClick}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center animate-fade-in">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-slate-900 font-semibold mb-1">
                              {courses.length === 0 ? 'No courses enrolled yet' : 'No courses found'}
                            </h3>
                            <p className="text-slate-500 text-sm mb-4">
                              {courses.length === 0
                                ? 'Browse available courses and enroll to get started.'
                                : 'Try selecting a different category.'}
                            </p>
                        </div>
                    )}
                </section>

                {/* Learning Activity Chart (Mobile View) */}
                <section className="block xl:hidden">
                    <LearningChart />
                </section>
            </div>

            {/* Right Column (Widgets) */}
            <div className="xl:col-span-4 flex flex-col gap-6">

                {/* Profile / Stats Widget */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/20">
                        <div className="w-full h-full rounded-2xl border-2 border-white overflow-hidden bg-white">
                             <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">{user.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{authUser?.department || 'Student'}</p>
                        <div className="flex gap-4 mt-3">
                             <div className="flex flex-col">
                                 <span className="text-lg font-bold text-slate-900 leading-none">{courses.length}</span>
                                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">Courses</span>
                             </div>
                             <div className="w-px h-8 bg-slate-100"></div>
                             <div className="flex flex-col">
                                 <span className="text-lg font-bold text-slate-900 leading-none">{exams.length}</span>
                                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">Exams</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Gamification Widget */}
                <XPWidget />

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#FFFAF0] border border-[#FEEBC8] rounded-2xl p-5 flex flex-col justify-between h-40 cursor-pointer hover:shadow-md hover:translate-y-[-2px] transition-all group">
                         <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-2">
                             <MessageSquare className="w-5 h-5 text-orange-500" />
                         </div>
                         <div>
                             <h4 className="font-bold text-slate-800 text-sm mb-1">Consultation</h4>
                             <p className="text-[10px] text-slate-500 leading-tight">Get a mentor to help your learning</p>
                         </div>
                         <div className="self-end bg-white p-1.5 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                             <ArrowUpRight className="w-3 h-3 text-orange-500" />
                         </div>
                    </div>
                    <div className="bg-[#FDF4FF] border border-[#F5D0FE] rounded-2xl p-5 flex flex-col justify-between h-40 cursor-pointer hover:shadow-md hover:translate-y-[-2px] transition-all group">
                         <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-2">
                             <Target className="w-5 h-5 text-purple-500" />
                         </div>
                         <div>
                             <h4 className="font-bold text-slate-800 text-sm mb-1">Set Target</h4>
                             <p className="text-[10px] text-slate-500 leading-tight">Plan your study timeline</p>
                         </div>
                         <div className="self-end bg-white p-1.5 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                             <ArrowUpRight className="w-3 h-3 text-purple-500" />
                         </div>
                    </div>
                </div>

                {/* Chart (Desktop Only in Sidebar) */}
                <div className="hidden xl:block h-72">
                    <LearningChart />
                </div>

                {/* Upcoming Exams */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-sm font-bold text-slate-800">Upcoming Exams</h3>
                        <button
                            onClick={() => onNavigate('/exams')}
                            className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary-dark transition-colors bg-indigo-50 px-2 py-1 rounded-md"
                        >
                            See All <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    {exams.length > 0 ? (
                      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                          {exams.map(exam => (
                              <ExamCard key={exam.id} exam={exam} />
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-6">No upcoming exams scheduled.</p>
                    )}
                </div>

            </div>
        </div>

      </div>

      {/* FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/30 flex items-center justify-center text-white hover:scale-105 hover:bg-primary active:scale-90 transition-all duration-300 z-40 group"
        aria-label="Add New Course"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Course Creation Modal */}
      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCourseCreated={handleAddCourse}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleConfirmDelete}
        courseTitle={courseToDelete?.title || ''}
      />

    </DashboardLayout>
  );
};