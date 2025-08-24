import { useCallback, useMemo } from 'react';
import { useApi, useMutation, usePaginatedApi } from './useApi';
import apiClient from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import type { Course, CourseFilters, PaginatedResponse } from '@/types';

/**
 * Hook for course management operations
 */
export function useCourses(filters?: CourseFilters) {
  const { addToast } = useAppStore();

  // Fetch courses with pagination and filtering
  const {
    data: courses,
    loading,
    error,
    hasNext,
    total,
    page,
    loadMore,
    execute: fetchCourses,
    refresh: refreshCourses,
    reset: resetCourses
  } = usePaginatedApi(
    async (page: number, pageSize: number, courseFilters?: CourseFilters) => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(courseFilters?.query && { query: courseFilters.query }),
        ...(courseFilters?.category && courseFilters.category !== 'all' && { category: courseFilters.category }),
        ...(courseFilters?.difficulty && courseFilters.difficulty !== 'all' && { difficulty: courseFilters.difficulty }),
        ...(courseFilters?.status && courseFilters.status !== 'all' && { status: courseFilters.status }),
        ...(courseFilters?.sort && { sort: courseFilters.sort }),
        ...(courseFilters?.order && { order: courseFilters.order })
      });

      const response = await apiClient.get(`/courses?${params.toString()}`);
      return response as PaginatedResponse<Course>;
    },
    20, // page size
    {
      immediate: false, // Disabled for development - using mock data from store
      cacheTime: 5 * 60 * 1000, // 5 minutes
      onError: () => {
        addToast({
          type: 'error',
          message: 'Failed to load courses. Please try again.',
          duration: 5000
        });
      }
    }
  );

  // Fetch enrolled courses
  const {
    data: enrolledCourses,
    loading: loadingEnrolled,
    error: enrolledError,
    execute: fetchEnrolledCourses,
    refresh: refreshEnrolledCourses
  } = useApi(
    async () => {
      const response = await apiClient.get('/me/enrollments');
      return response as Course[];
    },
    {
      immediate: false, // Disabled for development - using mock data from store
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Fetch single course details
  const {
    data: selectedCourse,
    loading: loadingCourse,
    error: courseError,
    execute: fetchCourse,
    setData: setSelectedCourse,
    reset: resetSelectedCourse
  } = useApi(
    async (courseId: string) => {
      const response = await apiClient.get(`/courses/${courseId}`);
      return response as Course;
    },
    {
      immediate: false,
      cacheTime: 15 * 60 * 1000, // 15 minutes
    }
  );

  // Fetch course recommendations
  const {
    data: recommendations,
    loading: loadingRecommendations,
    execute: fetchRecommendations,
    refresh: refreshRecommendations
  } = useApi(
    async (studentId?: string) => {
      const url = studentId ? `/recommendations?studentId=${studentId}` : '/recommendations';
      const response = await apiClient.get(url);
      return response as Course[];
    },
    {
      immediate: false, // Disabled for development - using mock data from store
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  // Enroll in course mutation
  const enrollMutation = useMutation(
    async (courseId: string) => {
      await apiClient.post(`/courses/${courseId}/enroll`);
      return courseId;
    },
    {
      optimisticUpdate: (courseId) => {
        // Find the course and mark as enrolled
        const course = courses?.find(c => c.id === courseId);
        if (course) {
          return { ...course, enrolled: true };
        }
        return courseId;
      },
      onSuccess: (courseId) => {
        addToast({
          type: 'success',
          message: 'Successfully enrolled in course!',
          duration: 3000
        });
        
        // Refresh enrolled courses and recommendations
        refreshEnrolledCourses();
        refreshRecommendations();
        
        // Update the course in the list
        if (selectedCourse && selectedCourse.id === courseId) {
          setSelectedCourse({ ...selectedCourse, enrolled: true });
        }
      }
    }
  );

  // Unenroll from course mutation
  const unenrollMutation = useMutation(
    async (courseId: string) => {
      await apiClient.delete(`/courses/${courseId}/enroll`);
      return courseId;
    },
    {
      optimisticUpdate: (courseId) => {
        const course = courses?.find(c => c.id === courseId);
        if (course) {
          return { ...course, enrolled: false };
        }
        return courseId;
      },
      onSuccess: (courseId) => {
        addToast({
          type: 'info',
          message: 'Successfully unenrolled from course.',
          duration: 3000
        });
        
        // Refresh enrolled courses
        refreshEnrolledCourses();
        
        // Update the course in the list
        if (selectedCourse && selectedCourse.id === courseId) {
          setSelectedCourse({ ...selectedCourse, enrolled: false });
        }
      }
    }
  );

  // Update course progress mutation
  const updateProgressMutation = useMutation(
    async (data: { courseId: string; lessonId: string; completed: boolean; timeSpent?: number }) => {
      const response = await apiClient.patch(`/courses/${data.courseId}/progress`, {
        lessonId: data.lessonId,
        completed: data.completed,
        timeSpent: data.timeSpent,
        completedAt: data.completed ? new Date().toISOString() : null
      });
      return response as Course;
    },
    {
      optimisticUpdate: (data) => {
        if (selectedCourse && selectedCourse.id === data.courseId) {
          // Update the progress optimistically
          const updatedCourse = { ...selectedCourse };
          
          if (data.completed) {
            updatedCourse.stats.completedLessons += 1;
            updatedCourse.progress.percentage = Math.round(
              (updatedCourse.stats.completedLessons / updatedCourse.stats.totalLessons) * 100
            );
          }
          
          return updatedCourse;
        }
        return data;
      },
      onSuccess: (updatedCourse) => {
        // Update the selected course
        if (selectedCourse && selectedCourse.id === updatedCourse.id) {
          setSelectedCourse(updatedCourse);
        }
        
        // Refresh enrolled courses to update progress there too
        refreshEnrolledCourses();

        addToast({
          type: 'success',
          message: 'Progress updated successfully!',
          duration: 2000
        });
      }
    }
  );

  // Search courses
  const searchCourses = useCallback(async (query: string) => {
    const searchFilters: CourseFilters = { ...filters, query };
    return fetchCourses(searchFilters);
  }, [filters, fetchCourses]);

  // Filter courses
  const filterCourses = useCallback(async (newFilters: CourseFilters) => {
    resetCourses(); // Reset pagination
    return fetchCourses(newFilters);
  }, [fetchCourses, resetCourses]);

  // Get course by ID from loaded courses
  const getCourseById = useCallback((courseId: string): Course | undefined => {
    return courses?.find(course => course.id === courseId) || 
           enrolledCourses?.find(course => course.id === courseId) ||
           recommendations?.find(course => course.id === courseId);
  }, [courses, enrolledCourses, recommendations]);

  // Get recently accessed courses
  const recentCourses = useMemo(() => {
    if (!enrolledCourses) return [];
    
    return enrolledCourses
      .filter(course => course.lastAccessedISO)
      .sort((a, b) => {
        const dateA = new Date(a.lastAccessedISO!).getTime();
        const dateB = new Date(b.lastAccessedISO!).getTime();
        return dateB - dateA;
      })
      .slice(0, 3);
  }, [enrolledCourses]);

  // Get courses by category
  const getCoursesByCategory = useCallback((category: string): Course[] => {
    if (!courses) return [];
    return courses.filter(course => course.category === category);
  }, [courses]);

  // Get course statistics
  const courseStats = useMemo(() => {
    if (!enrolledCourses) return null;

    const completed = enrolledCourses.filter(course => 
      course.progress.percentage === 100
    ).length;

    const inProgress = enrolledCourses.filter(course => 
      course.progress.percentage > 0 && course.progress.percentage < 100
    ).length;

    const notStarted = enrolledCourses.filter(course => 
      course.progress.percentage === 0
    ).length;

    const totalHours = enrolledCourses.reduce((total, course) => 
      total + (course.stats.timeSpent || 0), 0
    );

    const averageProgress = enrolledCourses.length > 0 
      ? enrolledCourses.reduce((sum, course) => sum + course.progress.percentage, 0) / enrolledCourses.length
      : 0;

    return {
      total: enrolledCourses.length,
      completed,
      inProgress,
      notStarted,
      totalHours: Math.round(totalHours * 10) / 10,
      averageProgress: Math.round(averageProgress)
    };
  }, [enrolledCourses]);

  // Convenient action functions
  const enroll = useCallback((courseId: string) => {
    return enrollMutation.mutate(courseId);
  }, [enrollMutation.mutate]);

  const unenroll = useCallback((courseId: string) => {
    return unenrollMutation.mutate(courseId);
  }, [unenrollMutation.mutate]);

  const updateProgress = useCallback((data: { courseId: string; lessonId: string; completed: boolean; timeSpent?: number }) => {
    return updateProgressMutation.mutate(data);
  }, [updateProgressMutation.mutate]);

  const selectCourse = useCallback((courseId: string) => {
    return fetchCourse(courseId);
  }, [fetchCourse]);

  return {
    // Data
    courses: courses || [],
    enrolledCourses: enrolledCourses || [],
    selectedCourse,
    recommendations: recommendations || [],
    recentCourses,
    courseStats,
    
    // Loading states
    loading,
    loadingEnrolled,
    loadingCourse,
    loadingRecommendations,
    isEnrolling: enrollMutation.loading,
    isUnenrolling: unenrollMutation.loading,
    isUpdatingProgress: updateProgressMutation.loading,
    
    // Error states
    error,
    enrolledError,
    courseError,
    enrollError: enrollMutation.error,
    unenrollError: unenrollMutation.error,
    progressError: updateProgressMutation.error,
    
    // Pagination
    hasNext,
    total,
    page,
    loadMore,
    
    // Optimistic states
    isOptimisticEnrollment: enrollMutation.isOptimistic,
    isOptimisticProgress: updateProgressMutation.isOptimistic,
    
    // Actions
    fetchCourses,
    refreshCourses,
    resetCourses,
    fetchEnrolledCourses,
    refreshEnrolledCourses,
    selectCourse,
    resetSelectedCourse,
    fetchRecommendations,
    refreshRecommendations,
    searchCourses,
    filterCourses,
    enroll,
    unenroll,
    updateProgress,
    
    // Utility functions
    getCourseById,
    getCoursesByCategory,
    
    // Raw mutations for advanced usage
    enrollMutation,
    unenrollMutation,
    updateProgressMutation
  };
}
