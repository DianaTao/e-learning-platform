import type { 
  APISuccess, 
  APIError, 
  User, 
  Course, 
  Assignment, 
  UserAnalytics,
  LoginForm,
  RegisterForm,
  PaginatedResponse,
  CourseFilters,
  AssignmentFilters
} from '@/types';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Enhanced API functions (extending the basic apiGet/apiPost)
class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APISuccess<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Enhanced error handling following backend analysis specs
        const apiError: APIError = {
          error: {
            code: data.error?.code || `HTTP_${response.status}`,
            message: data.error?.message || `Request failed with status ${response.status}`,
            details: data.error?.details,
            field: data.error?.field,
            timestamp: new Date(),
            requestId: data.error?.requestId || `req_${Date.now()}`
          },
          success: false
        };
        
        // Handle specific error codes
        if (response.status === 401) {
          // Token expired, attempt refresh
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        } else if (response.status === 429) {
          // Rate limited
          const retryAfter = response.headers.get('Retry-After');
          if (retryAfter) {
            apiError.error.details = { retryAfter: parseInt(retryAfter) };
          }
        }
        
        throw apiError;
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Basic HTTP methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<APISuccess<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<APISuccess<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<APISuccess<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<APISuccess<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<APISuccess<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload support
  async upload<T>(endpoint: string, formData: FormData): Promise<APISuccess<T>> {
    const headers = this.getAuthHeaders();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    return data;
  }
}

// Create API client instance
const apiClient = new APIClient(API_BASE_URL);

// Legacy functions (for backward compatibility)
export const apiGet = <T>(endpoint: string): Promise<T> => {
  return apiClient.get<T>(endpoint).then(response => response.data);
};

export const apiPost = <T>(endpoint: string, data?: any): Promise<T> => {
  return apiClient.post<T>(endpoint, data).then(response => response.data);
};

// Enhanced API functions
export const api = {
  // Authentication
  auth: {
    login: (credentials: LoginForm) => 
      apiClient.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', credentials),
    
    register: (userData: RegisterForm) => 
      apiClient.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', userData),
    
    logout: () => 
      apiClient.post('/auth/logout'),
    
    refreshToken: () => 
      apiClient.post<{ accessToken: string; expiresIn: number }>('/auth/refresh-token'),
    
    forgotPassword: (email: string) => 
      apiClient.post('/auth/forgot-password', { email }),
    
    resetPassword: (token: string, password: string) => 
      apiClient.post('/auth/reset-password', { token, password }),
    
    verifyEmail: (token: string) => 
      apiClient.get(`/auth/verify-email/${token}`),
  },

  // User management
  user: {
    getProfile: () => 
      apiClient.get<User>('/user/profile'),
    
    updateProfile: (userData: Partial<User>) => 
      apiClient.put<User>('/user/profile', userData),
    
    updatePreferences: (preferences: Partial<User['preferences']>) => 
      apiClient.patch<User>('/user/preferences', preferences),
    
    uploadAvatar: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return apiClient.upload<{ avatarUrl: string }>('/user/avatar', formData);
    },
    
    deleteAccount: () => 
      apiClient.delete('/user/account'),
  },

  // Courses
  courses: {
    getAll: (filters?: CourseFilters) => 
      apiClient.get<PaginatedResponse<Course>>('/courses', filters),
    
    getEnrolled: () => 
      apiClient.get<Course[]>('/courses/enrolled'),
    
    getById: (id: string) => 
      apiClient.get<Course>(`/courses/${id}`),
    
    enroll: (courseId: string) => 
      apiClient.post(`/courses/${courseId}/enroll`),
    
    unenroll: (courseId: string) => 
      apiClient.delete(`/courses/${courseId}/unenroll`),
    
    getProgress: (courseId: string) => 
      apiClient.get<{ progress: number; completedLessons: string[] }>(`/courses/${courseId}/progress`),
    
    updateProgress: (courseId: string, lessonId: string) => 
      apiClient.put(`/courses/${courseId}/progress`, { lessonId }),
    
    getRecommendations: () => 
      apiClient.get<Course[]>('/courses/recommendations'),
    
    getModules: (courseId: string) => 
      apiClient.get(`/courses/${courseId}/modules`),
  },

  // Lessons
  lessons: {
    getById: (id: string) => 
      apiClient.get(`/lessons/${id}`),
    
    markComplete: (id: string) => 
      apiClient.put(`/lessons/${id}/complete`),
  },

  // Assignments
  assignments: {
    getAll: (filters?: AssignmentFilters) => 
      apiClient.get<PaginatedResponse<Assignment>>('/assignments', filters),
    
    getById: (id: string) => 
      apiClient.get<Assignment>(`/assignments/${id}`),
    
    submit: (id: string, submission: { content?: string; files?: File[] }) => {
      const formData = new FormData();
      if (submission.content) {
        formData.append('content', submission.content);
      }
      if (submission.files) {
        submission.files.forEach(file => {
          formData.append('files', file);
        });
      }
      return apiClient.upload(`/assignments/${id}/submit`, formData);
    },
    
    getSubmissions: (id: string) => 
      apiClient.get(`/assignments/${id}/submissions`),
    
    deleteDraft: (id: string) => 
      apiClient.delete(`/assignments/${id}/submission`),
  },

  // Analytics
  analytics: {
    getOverview: () => 
      apiClient.get<UserAnalytics['overview']>('/analytics/overview'),
    
    getStudyTime: (period: 'daily' | 'weekly' | 'monthly' = 'daily') => 
      apiClient.get(`/analytics/study-time?period=${period}`),
    
    getCourseBreakdown: () => 
      apiClient.get<UserAnalytics['courseBreakdown']>('/analytics/course-breakdown'),
    
    getAchievements: () => 
      apiClient.get<UserAnalytics['achievements']>('/analytics/achievements'),
    
    getGoals: () => 
      apiClient.get<UserAnalytics['goals']>('/analytics/goals'),
    
    updateGoals: (goals: Partial<UserAnalytics['goals'][0]>[]) => 
      apiClient.put('/analytics/goals', { goals }),
  },

  // File uploads
  upload: {
    getPresignedUrl: (filename: string, contentType: string) => 
      apiClient.post<{ uploadUrl: string; fileUrl: string }>('/upload/presigned-url', {
        filename,
        contentType,
      }),
  },
};

// Mock API for development
export const mockApi = {
  // Mock data generators
  generateMockUser: (): User => ({
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    preferences: {
      notifications: true,
      studyTimeReminders: true,
      preferredStudyTime: 'morning',
      timezone: 'America/New_York',
    },
    enrollmentDate: new Date('2024-01-15'),
    lastLoginDate: new Date(),
    streak: {
      current: 7,
      longest: 21,
      lastActivityDate: new Date(),
    },
  }),

  generateMockCourses: (): Course[] => [
    {
      id: '1',
      title: 'React Fundamentals',
      description: 'Learn the basics of React including components, props, state, and hooks.',
      instructor: {
        id: 'inst-1',
        name: 'Sarah Wilson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b192?w=150&h=150&fit=crop&crop=face',
        rating: 4.8,
      },
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
      category: 'Programming',
      difficulty: 'Beginner',
      estimatedHours: 20,
      totalLessons: 12,
      completedLessons: 7,
      progress: 58,
      enrolled: true,
      enrollmentDate: new Date('2024-01-20'),
      lastAccessedDate: new Date('2024-01-28'),
      rating: 4.7,
      tags: ['React', 'JavaScript', 'Frontend'],
      prerequisites: ['HTML', 'CSS', 'JavaScript'],
    },
    {
      id: '2',
      title: 'Advanced TypeScript',
      description: 'Master advanced TypeScript concepts and patterns for large-scale applications.',
      instructor: {
        id: 'inst-2',
        name: 'Michael Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        rating: 4.9,
      },
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
      category: 'Programming',
      difficulty: 'Advanced',
      estimatedHours: 35,
      totalLessons: 18,
      completedLessons: 0,
      progress: 0,
      enrolled: true,
      enrollmentDate: new Date('2024-01-25'),
      rating: 4.8,
      tags: ['TypeScript', 'Advanced', 'Types'],
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
      category: 'Design',
      difficulty: 'Intermediate',
      estimatedHours: 25,
      totalLessons: 15,
      completedLessons: 15,
      progress: 100,
      enrolled: true,
      enrollmentDate: new Date('2023-12-10'),
      lastAccessedDate: new Date('2024-01-15'),
      rating: 4.5,
      tags: ['Design', 'UX', 'UI'],
      prerequisites: [],
    },
  ],

  generateMockAssignments: (): Assignment[] => [
    {
      id: '1',
      courseId: '1',
      courseName: 'React Fundamentals',
      title: 'Build a Todo App',
      description: 'Create a functional todo application using React hooks and local storage.',
      instructions: 'Build a todo app with the following features: add, edit, delete, and mark complete.',
      dueDate: new Date('2024-02-15'),
      points: 100,
      status: 'in_progress',
      priority: 'high',
      submissionType: 'file',
      allowedFileTypes: ['.zip', '.tar.gz'],
      maxFileSize: 10,
      maxAttempts: 3,
      submissions: [],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-28'),
    },
    {
      id: '2',
      courseId: '2',
      courseName: 'Advanced TypeScript',
      title: 'Type System Design',
      description: 'Design a complex type system for a library API.',
      instructions: 'Create TypeScript definitions that ensure type safety for the given API.',
      dueDate: new Date('2024-02-20'),
      points: 150,
      status: 'not_started',
      priority: 'medium',
      submissionType: 'file',
      allowedFileTypes: ['.ts', '.d.ts'],
      maxFileSize: 5,
      submissions: [],
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25'),
    },
    {
      id: '3',
      courseId: '3',
      courseName: 'UI/UX Design Principles',
      title: 'Mobile App Wireframes',
      description: 'Create wireframes for a mobile learning application.',
      instructions: 'Design wireframes showing the user flow for course discovery and enrollment.',
      dueDate: new Date('2024-01-30'),
      points: 80,
      status: 'graded',
      priority: 'low',
      submissionType: 'file',
      allowedFileTypes: ['.fig', '.sketch', '.pdf'],
      submissions: [{
        id: 'sub-1',
        assignmentId: '3',
        files: [],
        submittedAt: new Date('2024-01-28'),
        attempt: 1,
        status: 'graded',
      }],
      grade: {
        score: 92,
        maxScore: 100,
        percentage: 92,
        letterGrade: 'A-',
      },
      feedback: {
        id: 'fb-1',
        assignmentId: '3',
        instructorId: 'inst-3',
        comments: 'Excellent work on the user flow design. Consider adding more detailed annotations.',
        providedAt: new Date('2024-01-29'),
      },
      createdAt: new Date('2023-12-15'),
      updatedAt: new Date('2024-01-29'),
    },
  ],
};

export default apiClient;
