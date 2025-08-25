import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Award, 
  Target, 
  Calendar,
  BookOpen,
  Star,
  Flame
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AchievementSystem } from '@/components/achievements/AchievementSystem';
import { DetailedCourseBreakdown } from '@/components/analytics/DetailedCourseBreakdown';
import { EnhancedLearningGoals } from '@/components/analytics/EnhancedLearningGoals';
import { format, subDays } from 'date-fns';

export const ProgressAnalytics: React.FC = () => {
  const { user } = useAuthStore();
  const { analytics, isLoading, loadAnalytics } = useAppStore();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalytics();
    setLastUpdated(new Date());
  }, [loadAnalytics]);

  if (isLoading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  // Prepare chart data
  const studyTimeData = analytics.studyTime.daily.slice(-30).map(day => ({
    date: format(new Date(day.date), 'MMM dd'),
    hours: Math.round(day.minutes / 60 * 10) / 10,
    lessons: day.lessonsCompleted
  }));

  const categoryData = [
    { name: 'Programming', hours: 25, color: '#3b82f6' },
    { name: 'Design', hours: 15, color: '#8b5cf6' },
    { name: 'Business', hours: 8, color: '#10b981' },
    { name: 'Marketing', hours: 5, color: '#f59e0b' },
  ];

  const courseProgressData = analytics.courseBreakdown.map(course => ({
    name: course.courseName.length > 15 ? course.courseName.substring(0, 15) + '...' : course.courseName,
    progress: course.progress,
    timeSpent: Math.round(course.timeSpent / 60 * 10) / 10
  }));

  const coursePieColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6', '#eab308', '#06b6d4'];

  // Generate heatmap data for the last 364 days (52 weeks × 7 days)
  const generateHeatmapData = () => {
    const data = [];
    const totalDays = 52 * 7; // 364 days
    
    for (let i = 0; i < totalDays; i++) {
      const date = subDays(new Date(), totalDays - 1 - i);
      const dayData = analytics.studyTime.daily.find(d => 
        format(new Date(d.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        count: dayData ? Math.floor(dayData.minutes / 30) : 0, // Convert to intensity level
        day: date.getDay(),
        week: Math.floor(i / 7) // 7 days per week in new layout
      });
    }
    return data;
  };

  const heatmapData = generateHeatmapData();
  console.log('Heatmap data length:', heatmapData.length);
  console.log('Expected: 364 days (26 weeks × 14 days)');

  const getIntensityColor = (count: number) => {
    if (count === 0) return '#ebedf0';
    if (count <= 1) return '#9be9a8';
    if (count <= 2) return '#40c463';
    if (count <= 3) return '#30a14e';
    return '#216e39';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Learning Story 📈</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Look how far you've come! Let's see what your data tells us.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {format(lastUpdated, 'MMM dd, h:mm a')}
            </p>
            <button
              onClick={() => {
                loadAnalytics();
                setLastUpdated(new Date());
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
            >
              Refresh data
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card card-body bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.overview.totalHoursStudied}h
              </p>
              <p className="text-gray-600 dark:text-gray-400">Total Study Time</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                +2.5h this week
              </p>
            </div>
          </div>
        </div>

        <div className="card card-body bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.overview.coursesCompleted}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Courses Completed</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {analytics.overview.coursesInProgress} in progress
              </p>
            </div>
          </div>
        </div>

        <div className="card card-body bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-700">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.overview.averageQuizScore}%
              </p>
              <p className="text-gray-600 dark:text-gray-400">Average Score</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                +5% improvement
              </p>
            </div>
          </div>
        </div>

        <div className="card card-body bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
              <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.overview.currentStreak}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Day Streak</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Best: {analytics.overview.longestStreak} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Study Time Chart */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Study Time Trend</h2>
          <p className="text-gray-600 dark:text-gray-400">Daily study hours over the last 30 days</p>
        </div>
        <div className="card-body">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studyTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'hours' ? `${value}h` : value,
                    name === 'hours' ? 'Study Hours' : 'Lessons Completed'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course Progress */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Course Progress</h2>
          </div>
          <div className="card-body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                  <Bar dataKey="progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Completion Rate by Course */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Completion Rate by Course</h2>
          </div>
          <div className="card-body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseProgressData}
                    dataKey="progress"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {courseProgressData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={coursePieColors[index % coursePieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Activity Heatmap */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Learning Activity</h2>
          <p className="text-gray-600">Daily activity over the past year (52 weeks × 7 days)</p>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <div className="mb-4 text-sm text-gray-600">
              Grid: 52 columns × 7 rows = 364 days | Data points: {heatmapData.length}
            </div>
            
            {/* Month Headers */}
            <div className="flex gap-1 mb-2 ml-16">
              {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((month, monthIndex) => {
                // Each month spans approximately 4-5 weeks (52 weeks / 12 months ≈ 4.33 weeks per month)
                const weeksPerMonth = 52 / 12;
                const startWeek = Math.floor(monthIndex * weeksPerMonth);
                const endWeek = Math.floor((monthIndex + 1) * weeksPerMonth);
                const weekSpan = endWeek - startWeek;
                
                return (
                  <div 
                    key={month} 
                    className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center"
                    style={{ 
                      width: `${weekSpan * 100 / 52}%`
                    }}
                  >
                    {month}
                  </div>
                );
              })}
            </div>
            
            {/* Day Labels and Heatmap */}
            <div className="flex" style={{ aspectRatio: '52/7' }}>
              {/* Day of Week Labels */}
              <div className="flex flex-col mr-2 w-16" style={{ height: '100%' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => (
                  <div key={day} className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center" style={{ height: 'calc(100% / 7)' }}>
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Heatmap Grid */}
              <div className="grid gap-1 flex-1" style={{ 
                gridTemplateColumns: 'repeat(52, 1fr)',
                gridTemplateRows: 'repeat(7, 1fr)'
              }}>
                {Array.from({ length: 52 * 7 }, (_, index) => {
                  const data = heatmapData[index];
                  if (!data) return <div key={index} className="w-full h-full min-w-[8px] min-h-[8px]" />;
                  
                  const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                  
                  return (
                    <div
                      key={index}
                      className="w-full h-full min-w-[8px] min-h-[8px] rounded-sm cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: getIntensityColor(data.count) }}
                      title={`${formattedDate}\nStudy time: ${data.count * 30} minutes`}
                    />
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>Less</span>
              <div className="flex space-x-1">
                {[0, 1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: getIntensityColor(level) }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement System */}
      <AchievementSystem 
        achievements={analytics.achievements}
        skillLevels={analytics.skillLevels}
        onAchievementUnlocked={(achievement) => {
          console.log('Achievement unlocked:', achievement.title);
        }}
      />

      {/* Enhanced Learning Goals */}
      <EnhancedLearningGoals 
        weeklyGoals={analytics.weeklyGoals}
        courseGoals={analytics.courseGoals}
        learningPaces={analytics.learningPaces}
        weeklyProgress={analytics.weeklyProgress}
      />

      {/* Detailed Course Breakdown */}
      <DetailedCourseBreakdown courses={analytics.courseBreakdown} />
    </div>
  );
};
