import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Filter, 
  Grid3X3, 
  List,
  Search,
  Star,
  Play,
  Calendar,
  Award
} from 'lucide-react';
import { useCourses } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { CourseCard } from '@/components/courses/CourseCard';
import { CourseListItem } from '@/components/courses/CourseListItem';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { CourseCategory, CourseDifficulty } from '@/types';

export const CourseDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<CourseDifficulty | 'all'>('all');
  
  const { user } = useAuthStore();
  // Try to use the new hook first, but fallback to store if needed
  const hookData = useCourses();
  const storeData = useAppStore();
  
  // Use hook data if available, otherwise fallback to store
  const enrolledCourses = hookData.enrolledCourses.length > 0 ? hookData.enrolledCourses : storeData.courses.filter(c => c.enrolled);
  const recentCourses = hookData.recentCourses;
  const recommendations = hookData.recommendations.length > 0 ? hookData.recommendations : storeData.courses.filter(c => !c.enrolled);
  const courseStats = hookData.courseStats;
  const loading = hookData.loading || storeData.isLoading;
  
  // Debug logging (commented out - application working correctly)
  // console.log('CourseDashboard Debug:', {
  //   hookEnrolled: hookData.enrolledCourses.length,
  //   hookRecommendations: hookData.recommendations.length,
  //   storeCourses: storeData.courses.length,
  //   finalEnrolled: enrolledCourses.length,
  //   finalRecommendations: recommendations.length,
  //   hookLoading: hookData.loading,
  //   storeLoading: storeData.isLoading,
  //   finalLoading: loading
  // });
  const enroll = hookData.enroll;
  const updateProgress = hookData.updateProgress;

  // Load courses from store if hook data is empty
  useEffect(() => {
    if (hookData.enrolledCourses.length === 0 && storeData.courses.length === 0) {
      storeData.loadCourses();
    }
  }, [hookData.enrolledCourses.length, storeData.courses.length, storeData.loadCourses]);

  // Filter enrolled courses based on search and filters
  const filteredEnrolledCourses = enrolledCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Filter recommendations as well
  const filteredRecommendations = recommendations.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Use stats from the hook
  const totalHours = courseStats?.totalHours || 0;
  const completedCourses = courseStats?.completed || 0;
  const inProgressCourses = courseStats?.inProgress || 0;

  const handleContinueLearning = (courseId: string) => {
    // Find next lesson and update progress
    const course = enrolledCourses.find(c => c.id === courseId);
    if (course) {
      if (hookData.enrolledCourses.length > 0) {
        // Use new hook method
        const nextLessonId = `lesson-${course.stats.completedLessons + 1}`;
        updateProgress({ 
          courseId, 
          lessonId: nextLessonId, 
          completed: true,
          timeSpent: 30 // 30 minutes default
        });
      } else {
        // Fallback to store method
        const nextLessonId = `lesson-${course.stats?.completedLessons || course.completedLessons || 0 + 1}`;
        storeData.updateCourseProgress(courseId, nextLessonId);
      }
    }
  };

  if (loading && enrolledCourses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
        <div className="flex items-center justify-between relative">
          <div>
            <h1 className="text-3xl font-bold mb-3">
              Hey {user?.firstName}! 🎯
            </h1>
            <p className="text-white/90 text-lg font-medium mb-1">
              What are we learning today?
            </p>
            <p className="text-white/70 text-sm">
              You're doing great – keep the momentum going!
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">{user?.streak.current}</div>
                <div className="text-white/80 text-sm font-medium">🔥 day streak</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">{completedCourses}</div>
                <div className="text-white/80 text-sm font-medium">✅ completed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">{totalHours}h</div>
                <div className="text-white/80 text-sm font-medium">⏱️ learned</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all hover:shadow-lg group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{enrolledCourses.length}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">courses enrolled</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all hover:shadow-lg group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
              Done
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{completedCourses}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">finished strong</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-700 transition-all hover:shadow-lg group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
              Busy
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{inProgressCourses}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">in the works</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 transition-all hover:shadow-lg group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
              Time
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{totalHours}h</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">time invested</p>
        </div>
      </div>

      {/* Recently Accessed */}
      {enrolledCourses.some(course => course.lastAccessedDate) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Jump back in 🚀</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Pick up where you left off</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {enrolledCourses
                .filter(course => course.lastAccessedDate)
                .sort((a, b) => 
                  new Date(b.lastAccessedDate!).getTime() - new Date(a.lastAccessedDate!).getTime()
                )
                .slice(0, 3)
                .map(course => (
                  <div key={course.id} className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-25 dark:from-gray-700 dark:to-gray-700 rounded-xl hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 cursor-pointer transition-all group border border-transparent hover:border-indigo-100 dark:hover:border-indigo-700">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-16 h-16 rounded-xl object-cover shadow-sm"
                    />
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{course.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        {course.progress}% done • with {course.instructor.name}
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleContinueLearning(course.id)}
                      className="ml-4 bg-white dark:bg-gray-700 p-3 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl shadow-sm group-hover:shadow-md transition-all border border-gray-100 dark:border-gray-600"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card card-body">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
              placeholder="Search courses by name, instructor, or description..."
            />
          </div>

          {/* Filters and View Toggle */}
          <div className="flex items-center space-x-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CourseCategory | 'all')}
              className="input w-auto"
            >
              <option value="all">All Categories</option>
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
              <option value="Marketing">Marketing</option>
              <option value="Other">Other</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as CourseDifficulty | 'all')}
              className="input w-auto"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <div className="card bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 border-slate-200 dark:border-slate-700">
          <div className="card-header bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-700 dark:to-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Courses</h2>
          </div>
          <div className="card-body">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEnrolledCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onContinue={() => handleContinueLearning(course.id)}
                    isEnrolled
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEnrolledCourses.map(course => (
                  <CourseListItem
                    key={course.id}
                    course={course}
                    onContinue={() => handleContinueLearning(course.id)}
                    isEnrolled
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommended Courses */}
      {filteredRecommendations.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recommended for You</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Based on your learning patterns and popular choices
            </p>
          </div>
          <div className="card-body">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecommendations.slice(0, 6).map((course, index) => {
                  // Simple recommendation reasons based on index
                  const reasons = [
                    "Students who took React Fundamentals also took this course",
                    "Same category as your enrolled courses",
                    "Popular course overall",
                    "Students who took React Fundamentals also took this course",
                    "Same category as your enrolled courses", 
                    "Popular course overall"
                  ];
                  
                  return (
                    <div key={course.id} className="relative">
                      <CourseCard
                        course={course}
                        onEnroll={() => hookData.enrolledCourses.length > 0 ? enroll(course.id) : storeData.enrollInCourse(course.id)}
                        isEnrolled={false}
                      />
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          💡 {reasons[index]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecommendations.slice(0, 6).map((course, index) => {
                  const reasons = [
                    "Students who took React Fundamentals also took this course",
                    "Same category as your enrolled courses",
                    "Popular course overall",
                    "Students who took React Fundamentals also took this course",
                    "Same category as your enrolled courses",
                    "Popular course overall"
                  ];
                  
                  return (
                    <div key={course.id} className="relative">
                      <CourseListItem
                        course={course}
                        onEnroll={() => hookData.enrolledCourses.length > 0 ? enroll(course.id) : storeData.enrollInCourse(course.id)}
                        isEnrolled={false}
                      />
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          💡 {reasons[index]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredEnrolledCourses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or browse all available courses.
          </p>
        </div>
      )}
    </div>
  );
};
