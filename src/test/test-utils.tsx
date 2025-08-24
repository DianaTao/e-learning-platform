import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Mock the stores to avoid actual state management in tests
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 'test-user',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      avatar: 'test-avatar.jpg',
      preferences: {
        notifications: true,
        studyTimeReminders: true,
        preferredStudyTime: 'evening',
        timezone: 'America/New_York',
      },
      enrollmentDate: new Date('2024-01-01'),
      lastLoginDate: new Date(),
      streak: {
        current: 5,
        longest: 12,
        lastActivityDate: new Date(),
      },
    },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    initializeAuth: vi.fn(),
  }),
}))

vi.mock('@/stores/appStore', () => ({
  useAppStore: () => ({
    courses: [
      {
        id: 'course-1',
        title: 'React Fundamentals',
        description: 'Learn the basics of React',
        instructor: { id: 'instructor-1', name: 'John Doe', rating: 4.5 },
        thumbnail: 'course-thumbnail.jpg',
        category: 'Programming' as const,
        difficulty: 'Beginner' as const,
        rating: 4.6,
        studentsCount: 1234,
        estimatedHours: 2,
        totalLessons: 12,
        enrolled: true,
        enrollmentDate: new Date('2024-01-01'),
        completedLessons: 7,
        progress: 58,
        tags: ['react', 'javascript', 'frontend'],
        stats: { totalLessons: 12, completedLessons: 7, estimatedHoursRemaining: 3 },
        lastAccessedDate: new Date(),
      }
    ],
    assignments: [
      {
        id: 'assignment-1',
        courseId: 'course-1',
        courseName: 'React Fundamentals',
        title: 'Build a Todo App',
        description: 'Create a functional todo application using React hooks and local storage.',
        dueDate: new Date('2024-02-14'),
        status: 'in_progress' as const,
        priority: 'high' as const,
        points: 100,
        grade: undefined,
        feedback: undefined,
        submissionHistory: [],
        resources: [],
      }
    ],
    isLoading: false,
    loadCourses: vi.fn(),
    loadAssignments: vi.fn(),
    addToast: vi.fn(),
    submitAssignment: vi.fn(),
    enrollInCourse: vi.fn(),
    updateCourseProgress: vi.fn(),
  }),
}))

vi.mock('@/stores/themeStore', () => ({
  useThemeStore: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
    initializeTheme: vi.fn(),
  }),
}))

// Mock ToastContainer to avoid toast-related errors
vi.mock('@/components/ui/ToastContainer', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
  default: () => <div data-testid="toast-container" />
}))

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

// Custom render function WITHOUT router (for App component)
const AllTheProvidersNoRouter = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Render function for App component (no router wrapper)
const renderApp = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProvidersNoRouter, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render, renderApp }

// Helper functions for common test scenarios
export const mockUser = {
  id: 'test-user',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  avatar: 'test-avatar.jpg',
  preferences: {
    notifications: true,
    studyTimeReminders: true,
    preferredStudyTime: 'evening' as const,
    timezone: 'America/New_York',
  },
  enrollmentDate: new Date('2024-01-01'),
  lastLoginDate: new Date(),
  streak: {
    current: 5,
    longest: 12,
    lastActivityDate: new Date(),
  },
}

export const mockCourse = {
  id: 'course-1',
  title: 'React Fundamentals',
  description: 'Learn the basics of React',
  instructor: {
    id: 'instructor-1',
    name: 'John Doe',
    avatar: 'instructor-avatar.jpg',
    rating: 4.8,
  },
  thumbnail: 'course-thumbnail.jpg',
  category: 'Programming' as const,
  difficulty: 'Beginner' as const,
  rating: 4.6,
  studentsCount: 1234,
  estimatedHours: 2, // Component expects estimatedHours, not duration
  totalLessons: 12, // Component expects totalLessons, not lessonsCount
  enrolled: true,
  enrollmentDate: new Date('2024-01-01'),
  completedLessons: 7,
  progress: 58, // Component expects progress percentage
  tags: ['react', 'javascript', 'frontend'],
  stats: {
    totalLessons: 12,
    completedLessons: 7,
    totalDuration: 120,
    completedDuration: 70,
    estimatedTimeRemaining: 50,
  },
  lastAccessedDate: new Date(),
}

export const mockAssignment = {
  id: 'assignment-1',
  title: 'Build a Todo App',
  description: 'Create a functional todo application using React hooks',
  courseId: 'course-1',
  courseName: 'React Fundamentals',
  dueDate: new Date('2024-12-25T23:59:59'),
  status: 'in_progress' as const,
  points: 100,
  submittedAt: null,
  grade: null,
  feedback: null,
}
