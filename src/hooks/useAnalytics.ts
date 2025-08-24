import { useCallback, useMemo } from 'react';
import { useApi, useMutation } from './useApi';
import apiClient from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import type { UserAnalytics } from '@/types';

interface StudyLogEntry {
  dateISO: string;
  minutes: number;
  courseCategory: string;
  courseId?: string;
  lessonId?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

interface AnalyticsSummary {
  hoursStudied: number;
  streak: {
    current: number;
    longest: number;
  };
  byCategory: Array<{
    name: string;
    minutes: number;
    percentage: number;
  }>;
  completion: {
    completed: number;
    inProgress: number;
    total: number;
  };
  averageScore: number;
  totalPoints: number;
  earnedPoints: number;
}

interface StudyGoal {
  id: string;
  type: 'weekly_hours' | 'course_completion' | 'streak_days';
  target: number;
  current: number;
  deadline?: string;
  title: string;
  description: string;
}

/**
 * Hook for analytics and progress tracking
 */
export function useAnalytics() {
  const { addToast } = useAppStore();

  // Fetch analytics summary
  const {
    data: summary,
    loading: loadingSummary,
    error: summaryError,
    execute: fetchSummary,
    refresh: refreshSummary
  } = useApi(
    async (window: '7d' | '30d' | '90d' | '1y' = '30d') => {
      const response = await apiClient.get(`/analytics/summary?window=${window}`);
      return response as AnalyticsSummary;
    },
    {
      immediate: false, // Disabled for development - using mock data from store
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch study logs
  const {
    data: studyLogs,
    loading: loadingStudyLogs,
    error: studyLogsError,
    execute: fetchStudyLogs,
    refresh: refreshStudyLogs
  } = useApi(
    async (params: { from?: string; to?: string; groupBy?: 'day' | 'week' | 'month' } = {}) => {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      if (params.groupBy) searchParams.append('groupBy', params.groupBy);

      const response = await apiClient.get(`/analytics/study-logs?${searchParams.toString()}`);
      return response as StudyLogEntry[];
    },
    {
      immediate: false, // Disabled for development - using mock data from store
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Fetch course analytics
  const {
    data: courseAnalytics,
    loading: loadingCourseAnalytics,
    error: courseAnalyticsError,
    execute: fetchCourseAnalytics,
    setData: setCourseAnalytics
  } = useApi(
    async (courseId: string) => {
      const response = await apiClient.get(`/analytics/course/${courseId}`);
      return response as {
        courseId: string;
        lessonTimeline: Array<{
          lessonId: string;
          title: string;
          completedAt?: string;
          timeSpent: number;
        }>;
        quizStats: Array<{
          quizId: string;
          title: string;
          score: number;
          completedAt: string;
          attempts: number;
        }>;
        totalTime: number;
        progressPercentage: number;
      };
    },
    {
      immediate: false,
      cacheTime: 15 * 60 * 1000, // 15 minutes
    }
  );

  // Fetch achievements
  const {
    data: achievements,
    loading: loadingAchievements,
    error: achievementsError,
    execute: fetchAchievements,
    refresh: refreshAchievements
  } = useApi(
    async () => {
      const response = await apiClient.get('/analytics/achievements');
      return response as Achievement[];
    },
    {
      immediate: false, // Disabled for development - using mock data from store
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  // Fetch study goals
  const {
    data: studyGoals,
    loading: loadingStudyGoals,
    error: studyGoalsError,
    execute: fetchStudyGoals,
    refresh: refreshStudyGoals
  } = useApi(
    async () => {
      const response = await apiClient.get('/analytics/study-goals');
      return response as StudyGoal[];
    },
    {
      immediate: false, // Disabled for development - using mock data from store
      cacheTime: 15 * 60 * 1000, // 15 minutes
    }
  );

  // Log study time mutation
  const logStudyTimeMutation = useMutation(
    async (data: { dateISO: string; minutes: number; courseCategory: string; courseId?: string; lessonId?: string }) => {
      const response = await apiClient.post('/analytics/study-logs', data);
      return response as StudyLogEntry;
    },
    {
      onSuccess: () => {
        // Refresh analytics data
        refreshSummary();
        refreshStudyLogs();
        refreshAchievements(); // Might unlock new achievements
      }
    }
  );

  // Create study goal mutation
  const createStudyGoalMutation = useMutation(
    async (goal: Omit<StudyGoal, 'id' | 'current'>) => {
      const response = await apiClient.post('/analytics/study-goals', goal);
      return response as StudyGoal;
    },
    {
      onSuccess: () => {
        refreshStudyGoals();
        addToast({
          type: 'success',
          message: 'Study goal created successfully!',
          duration: 3000
        });
      }
    }
  );

  // Update study goal mutation
  const updateStudyGoalMutation = useMutation(
    async (data: { goalId: string; updates: Partial<StudyGoal> }) => {
      const response = await apiClient.patch(`/analytics/study-goals/${data.goalId}`, data.updates);
      return response as StudyGoal;
    },
    {
      onSuccess: () => {
        refreshStudyGoals();
        addToast({
          type: 'success',
          message: 'Study goal updated successfully!',
          duration: 3000
        });
      }
    }
  );

  // Delete study goal mutation
  const deleteStudyGoalMutation = useMutation(
    async (goalId: string) => {
      await apiClient.delete(`/analytics/study-goals/${goalId}`);
      return goalId;
    },
    {
      onSuccess: () => {
        refreshStudyGoals();
        addToast({
          type: 'info',
          message: 'Study goal deleted',
          duration: 3000
        });
      }
    }
  );

  // Unlock achievement manually (for testing or special cases)
  const unlockAchievementMutation = useMutation(
    async (achievementId: string) => {
      const response = await apiClient.post(`/analytics/achievements/${achievementId}/unlock`);
      return response as Achievement;
    },
    {
      onSuccess: (achievement) => {
        refreshAchievements();
        addToast({
          type: 'success',
          message: `🎉 Achievement unlocked: ${achievement.title}!`,
          duration: 5000
        });
      }
    }
  );

  // Calculate study streaks
  const studyStreaks = useMemo(() => {
    if (!studyLogs) return { current: 0, longest: 0 };

    const sortedLogs = [...studyLogs].sort((a, b) => 
      new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (const log of sortedLogs) {
      const logDate = new Date(log.dateISO);
      
      if (lastDate) {
        const daysDiff = Math.floor((logDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          tempStreak++;
        } else if (daysDiff > 1) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      
      lastDate = logDate;
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak (consecutive days up to today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = sortedLogs.length - 1; i >= 0; i--) {
      const logDate = new Date(sortedLogs[i].dateISO);
      logDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { current: currentStreak, longest: longestStreak };
  }, [studyLogs]);

  // Calculate study time by category for charts
  const studyTimeByCategory = useMemo(() => {
    if (!studyLogs) return [];

    const categoryTotals = studyLogs.reduce((acc, log) => {
      acc[log.courseCategory] = (acc[log.courseCategory] || 0) + log.minutes;
      return acc;
    }, {} as Record<string, number>);

    const totalMinutes = Object.values(categoryTotals).reduce((sum, minutes) => sum + minutes, 0);

    return Object.entries(categoryTotals).map(([category, minutes]) => ({
      name: category,
      minutes,
      hours: Math.round((minutes / 60) * 10) / 10,
      percentage: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0
    }));
  }, [studyLogs]);

  // Calculate daily study time for the last 30 days
  const dailyStudyTime = useMemo(() => {
    if (!studyLogs) return [];

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayLogs = studyLogs.filter(log => log.dateISO.startsWith(date));
      const totalMinutes = dayLogs.reduce((sum, log) => sum + log.minutes, 0);
      
      return {
        date,
        minutes: totalMinutes,
        hours: Math.round((totalMinutes / 60) * 10) / 10
      };
    });
  }, [studyLogs]);

  // Get achievements by status
  const achievementsByStatus = useMemo(() => {
    if (!achievements) return { unlocked: [], inProgress: [], locked: [] };

    return achievements.reduce((acc, achievement) => {
      if (achievement.unlockedAt) {
        acc.unlocked.push(achievement);
      } else if (achievement.progress && achievement.target && achievement.progress > 0) {
        acc.inProgress.push(achievement);
      } else {
        acc.locked.push(achievement);
      }
      return acc;
    }, { unlocked: [], inProgress: [], locked: [] } as Record<string, Achievement[]>);
  }, [achievements]);

  // Convenient action functions
  const logStudyTime = useCallback((data: { minutes: number; courseCategory: string; courseId?: string; lessonId?: string }) => {
    const now = new Date().toISOString().split('T')[0];
    return logStudyTimeMutation.mutate({
      dateISO: now,
      ...data
    });
  }, [logStudyTimeMutation.mutate]);

  const createStudyGoal = useCallback((goal: Omit<StudyGoal, 'id' | 'current'>) => {
    return createStudyGoalMutation.mutate(goal);
  }, [createStudyGoalMutation.mutate]);

  const updateStudyGoal = useCallback((goalId: string, updates: Partial<StudyGoal>) => {
    return updateStudyGoalMutation.mutate({ goalId, updates });
  }, [updateStudyGoalMutation.mutate]);

  const deleteStudyGoal = useCallback((goalId: string) => {
    return deleteStudyGoalMutation.mutate(goalId);
  }, [deleteStudyGoalMutation.mutate]);

  const unlockAchievement = useCallback((achievementId: string) => {
    return unlockAchievementMutation.mutate(achievementId);
  }, [unlockAchievementMutation.mutate]);

  const selectCourse = useCallback((courseId: string) => {
    return fetchCourseAnalytics(courseId);
  }, [fetchCourseAnalytics]);

  return {
    // Data
    summary,
    studyLogs: studyLogs || [],
    courseAnalytics,
    achievements: achievements || [],
    studyGoals: studyGoals || [],
    
    // Computed data
    studyStreaks,
    studyTimeByCategory,
    dailyStudyTime,
    achievementsByStatus,
    
    // Loading states
    loadingSummary,
    loadingStudyLogs,
    loadingCourseAnalytics,
    loadingAchievements,
    loadingStudyGoals,
    isLoggingStudyTime: logStudyTimeMutation.loading,
    isCreatingGoal: createStudyGoalMutation.loading,
    isUpdatingGoal: updateStudyGoalMutation.loading,
    isDeletingGoal: deleteStudyGoalMutation.loading,
    isUnlockingAchievement: unlockAchievementMutation.loading,
    
    // Error states
    summaryError,
    studyLogsError,
    courseAnalyticsError,
    achievementsError,
    studyGoalsError,
    logStudyTimeError: logStudyTimeMutation.error,
    goalError: createStudyGoalMutation.error || updateStudyGoalMutation.error || deleteStudyGoalMutation.error,
    
    // Actions
    fetchSummary,
    refreshSummary,
    fetchStudyLogs,
    refreshStudyLogs,
    selectCourse,
    fetchAchievements,
    refreshAchievements,
    fetchStudyGoals,
    refreshStudyGoals,
    logStudyTime,
    createStudyGoal,
    updateStudyGoal,
    deleteStudyGoal,
    unlockAchievement,
    
    // Raw mutations for advanced usage
    logStudyTimeMutation,
    createStudyGoalMutation,
    updateStudyGoalMutation,
    deleteStudyGoalMutation,
    unlockAchievementMutation
  };
}
