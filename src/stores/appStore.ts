import { create } from 'zustand';
import type { Course, Assignment, UserAnalytics, ToastMessage, CourseFilters, AssignmentFilters } from '@/types';
import { api } from '@/lib/api';

interface AppState {
  // Data
  courses: Course[];
  assignments: Assignment[];
  analytics: UserAnalytics | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  toasts: ToastMessage[];
  
  // Filters
  courseFilters: CourseFilters;
  assignmentFilters: AssignmentFilters;
  
  // Actions
  loadCourses: () => Promise<void>;
  loadAssignments: () => Promise<void>;
  loadAnalytics: () => Promise<void>;
  
  // Course actions
  enrollInCourse: (courseId: string) => Promise<void>;
  unenrollFromCourse: (courseId: string) => Promise<void>;
  updateCourseProgress: (courseId: string, lessonId: string) => Promise<void>;
  
  // Assignment actions
  submitAssignment: (assignmentId: string, submission: { content?: string; files?: File[] }) => Promise<void>;
  
  // Filter actions
  setCourseFilters: (filters: Partial<CourseFilters>) => void;
  setAssignmentFilters: (filters: Partial<AssignmentFilters>) => void;
  
  // UI actions
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  courses: [],
  assignments: [],
  analytics: null,
  isLoading: false,
  error: null,
  toasts: [],
  courseFilters: {},
  assignmentFilters: {},

  // Data loading actions
  loadCourses: async () => {
    set({ isLoading: true, error: null });
    
    try {
      if (true) { // Use mock data in development
        // Use mock data in development (immediate load)
        const mockCourses = [
          {
            id: '1',
            title: 'React Fundamentals',
            description: 'Learn the basics of React including components, hooks, and state management.',
            instructor: {
              id: 'inst-1',
              name: 'Alex Johnson',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              rating: 4.8,
            },
            thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
            category: 'Programming' as const,
            difficulty: 'Beginner' as const,
            estimatedHours: 20,
            totalLessons: 12,
            completedLessons: 7,
            progress: 58,
            enrolled: true,
            enrollmentDate: new Date('2024-01-15'),
            lastAccessedDate: new Date('2024-01-28'),
            rating: 4.6,
            tags: ['React', 'JavaScript', 'Frontend'],
            prerequisites: ['HTML', 'CSS', 'JavaScript'],
          },
          {
            id: '2',
            title: 'Advanced TypeScript',
            description: 'Master advanced TypeScript concepts for large-scale applications.',
            instructor: {
              id: 'inst-2',
              name: 'Sarah Chen',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b056b34?w=150&h=150&fit=crop&crop=face',
              rating: 4.9,
            },
            thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
            category: 'Programming' as const,
            difficulty: 'Advanced' as const,
            estimatedHours: 35,
            totalLessons: 18,
            completedLessons: 2,
            progress: 12,
            enrolled: true,
            enrollmentDate: new Date('2024-01-10'),
            lastAccessedDate: new Date('2024-01-25'),
            rating: 4.7,
            tags: ['TypeScript', 'JavaScript', 'Types'],
            prerequisites: ['JavaScript', 'TypeScript Basics'],
          },
          {
            id: '3',
            title: 'UI/UX Design Principles',
            description: 'Learn fundamental design principles and user experience best practices.',
            instructor: {
              id: 'inst-3',
              name: 'Emily Rodriguez',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
              rating: 4.6,
            },
            thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
            category: 'Design' as const,
            difficulty: 'Intermediate' as const,
            estimatedHours: 25,
            totalLessons: 15,
            completedLessons: 0,
            progress: 0,
            enrolled: false,
            enrollmentDate: undefined,
            lastAccessedDate: undefined,
            rating: 4.5,
            tags: ['Design', 'UX', 'UI'],
            prerequisites: [],
          }
        ];
        set({ courses: mockCourses, isLoading: false });
      } else {
        const response = await api.courses.getEnrolled();
        set({ courses: response.data, isLoading: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load courses';
      set({ error: message, isLoading: false });
    }
  },

  loadAssignments: async () => {
    set({ isLoading: true, error: null });
    
    try {
      if (true) { // Use mock data in development
        // Use mock data in development (immediate load)
        const mockAssignments = [
          {
            id: '1',
            courseId: '1',
            courseName: 'React Fundamentals',
            title: 'Build a Todo App',
            description: 'Create a functional todo application using React hooks and local storage.',
            instructions: 'Build a todo app with the following features: add, edit, delete, and mark complete.',
            dueDate: new Date('2024-02-15'),
            points: 100,
            status: 'in_progress' as const,
            priority: 'high' as const,
            submissionType: 'file' as const,
            allowedFileTypes: ['.zip', '.tar.gz'],
            maxFileSize: 10,
            maxAttempts: 3,
            submissions: [],
            createdAt: new Date('2024-01-20'),
            updatedAt: new Date('2024-01-28'),
          },
          {
            id: '2',
            courseId: '1',
            courseName: 'React Fundamentals',
            title: 'Component Architecture',
            description: 'Design and implement a scalable component architecture.',
            instructions: 'Create reusable components following best practices.',
            dueDate: new Date('2024-01-29'),
            points: 85,
            status: 'overdue' as const,
            priority: 'medium' as const,
            submissionType: 'file' as const,
            allowedFileTypes: ['.zip'],
            maxFileSize: 5,
            maxAttempts: 2,
            submissions: [],
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-25'),
          },
          {
            id: '3',
            courseId: '2',
            courseName: 'Advanced TypeScript',
            title: 'Type System Design',
            description: 'Design a complex type system for a library API.',
            instructions: 'Implement advanced TypeScript types and patterns.',
            dueDate: new Date('2024-02-19'),
            points: 120,
            status: 'not_started' as const,
            priority: 'low' as const,
            submissionType: 'file' as const,
            allowedFileTypes: ['.ts', '.zip'],
            maxFileSize: 8,
            maxAttempts: 3,
            submissions: [],
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
          }
        ];
        set({ assignments: mockAssignments, isLoading: false });
      } else {
        const response = await api.assignments.getAll(get().assignmentFilters);
        set({ assignments: response.data.data, isLoading: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load assignments';
      set({ error: message, isLoading: false });
    }
  },

  loadAnalytics: async () => {
    set({ isLoading: true, error: null });
    
    try {
      if (true) { // Use mock data in development
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // Generate mock analytics data
        const mockAnalytics: UserAnalytics = {
          overview: {
            totalHoursStudied: 45.5,
            coursesCompleted: 3,
            coursesInProgress: 2,
            averageQuizScore: 87.3,
            currentStreak: 7,
            longestStreak: 21,
          },
          studyTime: {
            daily: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
              minutes: Math.floor(Math.random() * 120) + 30,
              lessonsCompleted: Math.floor(Math.random() * 5),
              coursesAccessed: ['1', '2'].slice(0, Math.floor(Math.random() * 3) + 1),
            })).reverse(),
            weekly: Array.from({ length: 12 }, (_, i) => ({
              week: `Week ${12 - i}`,
              minutes: Math.floor(Math.random() * 500) + 200,
              lessonsCompleted: Math.floor(Math.random() * 20) + 5,
            })),
            monthly: Array.from({ length: 6 }, (_, i) => ({
              month: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long' }),
              minutes: Math.floor(Math.random() * 2000) + 800,
              lessonsCompleted: Math.floor(Math.random() * 80) + 20,
            })).reverse(),
          },
          courseBreakdown: [
            {
              courseId: '1',
              courseName: 'React Fundamentals',
              timeSpent: 720,
              progress: 58,
              averageQuizScore: 85,
              lessonsCompleted: 7,
              totalLessons: 12,
              lastAccessed: new Date('2024-01-28'),
            },
            {
              courseId: '2',
              courseName: 'Advanced TypeScript',
              timeSpent: 180,
              progress: 12,
              averageQuizScore: 0,
              lessonsCompleted: 2,
              totalLessons: 18,
              lastAccessed: new Date('2024-01-26'),
            },
          ],
          achievements: [
            {
              id: '1',
              title: 'First Steps',
              description: 'Complete your first lesson',
              icon: '🎯',
              unlockedAt: new Date('2024-01-20'),
              progress: 100,
              requirements: 'Complete 1 lesson',
            },
            {
              id: '2',
              title: 'Week Warrior',
              description: 'Study for 7 consecutive days',
              icon: '🔥',
              unlockedAt: new Date('2024-01-28'),
              progress: 100,
              requirements: 'Study for 7 days straight',
            },
            {
              id: '3',
              title: 'Course Master',
              description: 'Complete your first course',
              icon: '🏆',
              progress: 75,
              requirements: 'Complete 1 full course',
            },
          ],
          goals: [
            {
              id: '1',
              title: 'Weekly Study Goal',
              description: 'Study for 10 hours this week',
              targetValue: 10,
              currentValue: 7.5,
              unit: 'hours',
              deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
              completed: false,
            },
            {
              id: '2',
              title: 'Course Completion',
              description: 'Complete React Fundamentals',
              targetValue: 1,
              currentValue: 0.58,
              unit: 'courses',
              deadline: new Date('2024-02-15'),
              completed: false,
            },
          ],
        };
        
        set({ analytics: mockAnalytics, isLoading: false });
      } else {
        const response = await api.analytics.getOverview();
        set({ analytics: { overview: response.data } as UserAnalytics, isLoading: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load analytics';
      set({ error: message, isLoading: false });
    }
  },

  // Course actions
  enrollInCourse: async (courseId: string) => {
    try {
      if (true) { // Use mock data in development
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { courses } = get();
        const updatedCourses = courses.map(course =>
          course.id === courseId
            ? { ...course, enrolled: true, enrollmentDate: new Date() }
            : course
        );
        set({ courses: updatedCourses });
        
        get().addToast({
          type: 'success',
          title: 'Enrollment Successful',
          message: 'You have been enrolled in the course!',
        });
      } else {
        await api.courses.enroll(courseId);
        await get().loadCourses();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to enroll in course';
      get().addToast({
        type: 'error',
        title: 'Enrollment Failed',
        message,
      });
    }
  },

  unenrollFromCourse: async (courseId: string) => {
    try {
      if (true) { // Use mock data in development
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { courses } = get();
        const updatedCourses = courses.filter(course => course.id !== courseId);
        set({ courses: updatedCourses });
        
        get().addToast({
          type: 'success',
          title: 'Unenrollment Successful',
          message: 'You have been unenrolled from the course.',
        });
      } else {
        await api.courses.unenroll(courseId);
        await get().loadCourses();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unenroll from course';
      get().addToast({
        type: 'error',
        title: 'Unenrollment Failed',
        message,
      });
    }
  },

  updateCourseProgress: async (courseId: string, lessonId: string) => {
    try {
      if (true) { // Use mock data in development
        const { courses } = get();
        const updatedCourses = courses.map(course => {
          if (course.id === courseId) {
            const newCompletedLessons = course.completedLessons + 1;
            const newProgress = Math.round((newCompletedLessons / course.totalLessons) * 100);
            return {
              ...course,
              completedLessons: newCompletedLessons,
              progress: newProgress,
              lastAccessedDate: new Date(),
            };
          }
          return course;
        });
        set({ courses: updatedCourses });
      } else {
        await api.courses.updateProgress(courseId, lessonId);
        await get().loadCourses();
      }
    } catch (error) {
      console.error('Failed to update course progress:', error);
    }
  },

  // Assignment actions
  submitAssignment: async (assignmentId: string, submission: { content?: string; files?: File[] }) => {
    try {
      if (true) { // Use mock data in development
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { assignments } = get();
        const updatedAssignments = assignments.map(assignment =>
          assignment.id === assignmentId
            ? { ...assignment, status: 'submitted' as const }
            : assignment
        );
        set({ assignments: updatedAssignments });
        
        get().addToast({
          type: 'success',
          title: 'Assignment Submitted',
          message: 'Your assignment has been submitted successfully!',
        });
      } else {
        await api.assignments.submit(assignmentId, submission);
        await get().loadAssignments();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit assignment';
      get().addToast({
        type: 'error',
        title: 'Submission Failed',
        message,
      });
    }
  },

  // Filter actions
  setCourseFilters: (filters: Partial<CourseFilters>) => {
    set({ courseFilters: { ...get().courseFilters, ...filters } });
  },

  setAssignmentFilters: (filters: Partial<AssignmentFilters>) => {
    set({ assignmentFilters: { ...get().assignmentFilters, ...filters } });
  },

  // UI actions
  addToast: (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    set({ toasts: [...get().toasts, newToast] });
    
    // Auto remove toast after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id: string) => {
    set({ toasts: get().toasts.filter(toast => toast.id !== id) });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Auto-initialize with mock data in development
if (true) { // Auto-initialize with mock data
  useAppStore.getState().loadCourses();
  useAppStore.getState().loadAssignments();
}
