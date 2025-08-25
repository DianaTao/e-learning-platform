import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, Target, TrendingUp, BookOpen, Calendar, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';

interface AnalyticsLesson {
  id: string;
  title: string;
  completedAt?: Date;
  timeSpent: number; // in minutes
  quizScore?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface AnalyticsModule {
  id: string;
  title: string;
  lessons: AnalyticsLesson[];
  totalTime: number;
  averageScore: number;
}

interface CourseAnalytics {
  courseId: string;
  courseName: string;
  timeSpent: number;
  progress: number;
  averageQuizScore: number;
  lessonsCompleted: number;
  totalLessons: number;
  lastAccessed: Date;
  modules: Module[];
  quizScores: { date: string; score: number }[];
  studyTimeTrend: { date: string; minutes: number }[];
}

interface DetailedCourseBreakdownProps {
  courses: CourseAnalytics[];
}

export const DetailedCourseBreakdown: React.FC<DetailedCourseBreakdownProps> = ({ courses }) => {
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  const toggleCourse = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Detailed Course Breakdown</h2>
        <p className="text-gray-600 dark:text-gray-400">Click on any course to see detailed progress and analytics</p>
      </div>
      <div className="card-body">
        <div className="space-y-4">
          {courses.map((course) => {
            const isExpanded = expandedCourses.has(course.courseId);
            const totalModules = course.modules.length;
            const completedModules = course.modules.filter(m => 
              m.lessons.every(l => l.completedAt)
            ).length;

            return (
              <div key={course.courseId} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {/* Course Header */}
                <div 
                  className="p-4 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => toggleCourse(course.courseId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">📚</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{course.courseName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            {course.lessonsCompleted} / {course.totalLessons} lessons
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {Math.round(course.timeSpent / 60 * 10) / 10}h
                          </span>
                          <span className="flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            {course.averageQuizScore > 0 ? `${course.averageQuizScore}%` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Progress Bar */}
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(course.progress)}`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[3rem]">
                          {course.progress}%
                        </span>
                      </div>
                      
                      {/* Expand/Collapse Icon */}
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <div className="p-6 space-y-6">
                      {/* Course Overview Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {course.progress}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {completedModules}/{totalModules}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Modules Completed</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {Math.round(course.timeSpent / 60 * 10) / 10}h
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total Time</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {course.averageQuizScore > 0 ? `${course.averageQuizScore}%` : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Score</div>
                        </div>
                      </div>

                      {/* Quiz Scores Trend */}
                      {course.quizScores.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Quiz Performance Trend
                          </h4>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={course.quizScores}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="date" 
                                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                                />
                                <YAxis domain={[0, 100]} />
                                <Tooltip 
                                  formatter={(value) => [`${value}%`, 'Score']}
                                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="score" 
                                  stroke="#3b82f6" 
                                  strokeWidth={2}
                                  dot={{ fill: '#3b82f6' }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* Study Time Trend */}
                      {course.studyTimeTrend.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Study Time Trend
                          </h4>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={course.studyTimeTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="date" 
                                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                                />
                                <YAxis />
                                <Tooltip 
                                  formatter={(value) => [`${Math.round(Number(value) / 60 * 10) / 10}h`, 'Study Time']}
                                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                                />
                                <Bar dataKey="minutes" fill="#10b981" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* Module Breakdown */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Module Breakdown
                        </h4>
                        <div className="space-y-3">
                          {course.modules.map((module) => {
                            const completedLessons = module.lessons.filter(l => l.completedAt).length;
                            const moduleProgress = (completedLessons / module.lessons.length) * 100;
                            
                            return (
                              <div key={module.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-gray-900 dark:text-white">{module.title}</h5>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span>{completedLessons}/{module.lessons.length} lessons</span>
                                    <span>{Math.round(module.totalTime / 60 * 10) / 10}h</span>
                                    <span>{module.averageScore > 0 ? `${module.averageScore}%` : 'N/A'}</span>
                                  </div>
                                </div>
                                
                                {/* Module Progress */}
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(moduleProgress)}`}
                                    style={{ width: `${moduleProgress}%` }}
                                  />
                                </div>
                                
                                {/* Lessons List */}
                                <div className="space-y-2">
                                  {module.lessons.map((lesson) => (
                                    <div key={lesson.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/30 rounded">
                                      <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${
                                          lesson.completedAt ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                        }`} />
                                        <span className={`text-sm ${
                                          lesson.completedAt 
                                            ? 'text-gray-900 dark:text-white' 
                                            : 'text-gray-600 dark:text-gray-400'
                                        }`}>
                                          {lesson.title}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                                          {lesson.difficulty}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                        {lesson.completedAt && (
                                          <span className="flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {format(lesson.completedAt, 'MMM dd')}
                                          </span>
                                        )}
                                        <span className="flex items-center">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {Math.round(lesson.timeSpent / 60 * 10) / 10}h
                                        </span>
                                        {lesson.quizScore !== undefined && (
                                          <span className="flex items-center">
                                            <Star className="w-3 h-3 mr-1" />
                                            {lesson.quizScore}%
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
