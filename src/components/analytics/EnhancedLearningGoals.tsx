import React, { useState } from 'react';
import { Target, Clock, Calendar, TrendingUp, Users, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';

interface WeeklyGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: 'hours' | 'lessons' | 'courses';
  deadline: Date;
  completed: boolean;
  weeklyTarget: number;
  dailyAverage: number;
  daysRemaining: number;
  onTrack: boolean;
}

interface CourseGoal {
  id: string;
  courseId: string;
  courseName: string;
  targetCompletionDate: Date;
  currentProgress: number;
  estimatedCompletionDate: Date;
  onTrack: boolean;
  classAverage: number;
  personalPace: number;
  paceComparison: 'ahead' | 'behind' | 'on_track';
}

interface LearningPace {
  courseId: string;
  courseName: string;
  personalPace: number; // lessons per week
  classAverage: number;
  difference: number;
  status: 'ahead' | 'behind' | 'on_track';
}

interface EnhancedLearningGoalsProps {
  weeklyGoals: WeeklyGoal[];
  courseGoals: CourseGoal[];
  learningPaces: LearningPace[];
  weeklyProgress: { date: string; hours: number; target: number }[];
}

export const EnhancedLearningGoals: React.FC<EnhancedLearningGoalsProps> = ({
  weeklyGoals,
  courseGoals,
  learningPaces,
  weeklyProgress
}) => {
  const [selectedGoalType, setSelectedGoalType] = useState<'weekly' | 'course' | 'pace'>('weekly');

  const getProgressColor = (progress: number, onTrack: boolean) => {
    if (progress >= 100) return 'bg-green-500';
    if (onTrack) return 'bg-blue-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (onTrack: boolean, completed: boolean) => {
    if (completed) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (onTrack) return <TrendingUp className="w-5 h-5 text-blue-500" />;
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const getPaceComparisonText = (pace: 'ahead' | 'behind' | 'on_track') => {
    switch (pace) {
      case 'ahead': return 'Ahead of class average';
      case 'behind': return 'Behind class average';
      case 'on_track': return 'On track with class average';
    }
  };

  const getPaceComparisonColor = (pace: 'ahead' | 'behind' | 'on_track') => {
    switch (pace) {
      case 'ahead': return 'text-green-600 dark:text-green-400';
      case 'behind': return 'text-red-600 dark:text-red-400';
      case 'on_track': return 'text-blue-600 dark:text-blue-400';
    }
  };

  const calculateDaysRemaining = (deadline: Date) => {
    const days = differenceInDays(deadline, new Date());
    return Math.max(0, days);
  };

  const calculateOnTrackStatus = (current: number, target: number, daysRemaining: number, weeklyTarget: number) => {
    if (current >= target) return true;
    const dailyNeeded = (target - current) / Math.max(1, daysRemaining);
    const dailyAverage = weeklyTarget / 7;
    return dailyNeeded <= dailyAverage * 1.2; // 20% buffer
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Goals & Targets</h2>
        <p className="text-gray-600 dark:text-gray-400">Track your learning progress and compare with class averages</p>
      </div>
      <div className="card-body">
        {/* Goal Type Selector */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setSelectedGoalType('weekly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedGoalType === 'weekly'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Weekly Goals
          </button>
          <button
            onClick={() => setSelectedGoalType('course')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedGoalType === 'course'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Course Targets
          </button>
          <button
            onClick={() => setSelectedGoalType('pace')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedGoalType === 'pace'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Learning Pace
          </button>
        </div>

        {/* Weekly Goals */}
        {selectedGoalType === 'weekly' && (
          <div className="space-y-6">
            {/* Weekly Progress Chart */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Weekly Progress Overview
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value}h`, 
                        name === 'hours' ? 'Actual' : 'Target'
                      ]}
                      labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                      name="Actual"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#10b981' }}
                      name="Target"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Goals List */}
            <div className="space-y-4">
              {weeklyGoals.map((goal) => {
                const daysRemaining = calculateDaysRemaining(goal.deadline);
                const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                const onTrack = calculateOnTrackStatus(goal.currentValue, goal.targetValue, daysRemaining, goal.weeklyTarget);
                
                return (
                  <div key={goal.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:via-gray-800/50 dark:to-slate-900/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(onTrack, goal.completed)}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{goal.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {goal.currentValue.toFixed(1)} / {goal.targetValue} {goal.unit}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {progress.toFixed(1)}% complete
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress, onTrack)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    {/* Goal Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-gray-900 dark:text-white font-medium">
                            {daysRemaining} days left
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            Due: {format(goal.deadline, 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-gray-900 dark:text-white font-medium">
                            {goal.dailyAverage.toFixed(1)}h/day
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            Daily average
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-gray-900 dark:text-white font-medium">
                            {goal.weeklyTarget.toFixed(1)}h/week
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            Weekly target
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className={`font-medium ${onTrack ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {onTrack ? 'On Track' : 'Behind'}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            Status
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Course Goals */}
        {selectedGoalType === 'course' && (
          <div className="space-y-4">
            {courseGoals.map((goal) => {
              const daysUntilTarget = differenceInDays(goal.targetCompletionDate, new Date());
              const daysUntilEstimated = differenceInDays(goal.estimatedCompletionDate, new Date());
              const isOverdue = isBefore(goal.targetCompletionDate, new Date());
              
              return (
                <div key={goal.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:via-gray-800/50 dark:to-slate-900/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(goal.onTrack, goal.currentProgress >= 100)}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{goal.courseName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Target: {format(goal.targetCompletionDate, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {goal.currentProgress.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {goal.personalPace.toFixed(1)} lessons/week
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal.currentProgress, goal.onTrack)}`}
                      style={{ width: `${goal.currentProgress}%` }}
                    />
                  </div>
                  
                  {/* Course Goal Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                          {isOverdue ? 'Overdue' : `${Math.abs(daysUntilTarget)} days`}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {isOverdue ? 'Past target date' : 'Until target'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">
                          {format(goal.estimatedCompletionDate, 'MMM dd')}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Estimated completion
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">
                          {goal.classAverage.toFixed(1)}%
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Class average
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className={`font-medium ${getPaceComparisonColor(goal.paceComparison)}`}>
                          {getPaceComparisonText(goal.paceComparison)}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Pace comparison
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Learning Pace Comparison */}
        {selectedGoalType === 'pace' && (
          <div className="space-y-6">
            {/* Pace Overview Chart */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Learning Pace vs Class Average
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={learningPaces}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="courseName" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value} lessons/week`, 
                        name === 'personalPace' ? 'Your Pace' : 'Class Average'
                      ]}
                    />
                    <Bar dataKey="personalPace" fill="#3b82f6" name="Your Pace" />
                    <Bar dataKey="classAverage" fill="#10b981" name="Class Average" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pace Details */}
            <div className="space-y-4">
              {learningPaces.map((pace) => (
                <div key={pace.courseId} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:via-gray-800/50 dark:to-slate-900/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{pace.courseName}</h4>
                      <p className={`text-sm font-medium ${getPaceComparisonColor(pace.status)}`}>
                        {getPaceComparisonText(pace.status)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {pace.personalPace.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        lessons/week
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {pace.personalPace.toFixed(1)}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">Your Pace</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {pace.classAverage.toFixed(1)}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">Class Average</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${pace.difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {pace.difference >= 0 ? '+' : ''}{pace.difference.toFixed(1)}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">Difference</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
