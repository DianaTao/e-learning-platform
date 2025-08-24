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

  // Generate heatmap data for the last 365 days
  const generateHeatmapData = () => {
    const data = [];
    for (let i = 364; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayData = analytics.studyTime.daily.find(d => 
        format(new Date(d.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        count: dayData ? Math.floor(dayData.minutes / 30) : 0, // Convert to intensity level
        day: date.getDay(),
        week: Math.floor(i / 7)
      });
    }
    return data;
  };

  const heatmapData = generateHeatmapData();

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

        {/* Category Distribution */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Time by Category</h2>
          </div>
          <div className="card-body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="hours"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}h`, 'Hours']} />
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
          <p className="text-gray-600">Daily activity over the past year</p>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-53 gap-1 w-fit">
              {Array.from({ length: 53 }, (_, weekIndex) => (
                <div key={weekIndex} className="grid grid-rows-7 gap-1">
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const dataIndex = weekIndex * 7 + dayIndex;
                    const data = heatmapData[dataIndex];
                    if (!data) return <div key={dayIndex} className="w-3 h-3" />;
                    
                    return (
                      <div
                        key={dayIndex}
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: getIntensityColor(data.count) }}
                        title={`${data.date}: ${data.count * 30} minutes`}
                      />
                    );
                  })}
                </div>
              ))}
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

      {/* Achievements and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Achievements */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Achievements</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {analytics.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${
                    achievement.unlockedAt 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/10 border-green-200 dark:border-green-800/30 shadow-sm dark:shadow-green-900/20' 
                      : 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:via-gray-800/50 dark:to-slate-900/30 border-gray-200 dark:border-gray-700/50 shadow-sm dark:shadow-gray-900/20'
                  }`}
                >
                  <div className="text-2xl mr-4">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      achievement.unlockedAt ? 'text-green-900 dark:text-green-100' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-sm ${
                      achievement.unlockedAt ? 'text-green-600 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    {!achievement.unlockedAt && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {achievement.progress}% complete
                        </p>
                      </div>
                    )}
                  </div>
                  {achievement.unlockedAt && (
                    <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Learning Goals */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Learning Goals</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {analytics.goals.map((goal) => (
                <div key={goal.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:via-gray-800/50 dark:to-slate-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{goal.title}</h3>
                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{goal.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span>Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {goal.currentValue.toFixed(1)} / {goal.targetValue} {goal.unit}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        goal.completed ? 'bg-green-600 dark:bg-green-500' : 'bg-blue-600 dark:bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }}
                    />
                  </div>
                  
                  {goal.deadline && (
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>Due: {format(new Date(goal.deadline), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course Breakdown */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Detailed Course Breakdown</h2>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Progress</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Time Spent</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Avg. Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Last Accessed</th>
                </tr>
              </thead>
              <tbody>
                {analytics.courseBreakdown.map((course) => (
                  <tr key={course.courseId} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">{course.courseName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {course.lessonsCompleted} / {course.totalLessons} lessons
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{course.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {Math.round(course.timeSpent / 60 * 10) / 10}h
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {course.averageQuizScore > 0 ? `${course.averageQuizScore}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {format(new Date(course.lastAccessed), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
