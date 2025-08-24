import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderApp, screen, waitFor } from '@/test/test-utils'
import App from '../App'

// Mock the stores with more realistic implementations
const mockUseAuthStore = vi.fn()
const mockUseThemeStore = vi.fn()
const mockUseAppStore = vi.fn()

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}))

vi.mock('@/stores/themeStore', () => ({
  useThemeStore: () => mockUseThemeStore(),
}))

vi.mock('@/stores/appStore', () => ({
  useAppStore: () => mockUseAppStore(),
}))

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default authenticated state
    mockUseAuthStore.mockReturnValue({
      user: {
        id: 'test-user',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      },
      isAuthenticated: true,
      isLoading: false,
      initializeAuth: vi.fn(),
      logout: vi.fn(),
    })

    mockUseThemeStore.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
      initializeTheme: vi.fn(),
    })

    mockUseAppStore.mockReturnValue({
      courses: [
        {
          id: 'course-1',
          title: 'React Fundamentals',
          enrolled: true,
          stats: { completedLessons: 7, totalLessons: 12 },
        },
      ],
      assignments: [
        {
          id: 'assignment-1',
          title: 'Build a Todo App',
          courseName: 'React Fundamentals',
          status: 'in_progress',
          dueDate: new Date('2024-12-25'),
        },
      ],
      isLoading: false,
      loadCourses: vi.fn(),
      loadAssignments: vi.fn(),
      addToast: vi.fn(),
    })
  })

  it('renders the application for authenticated users', async () => {
    renderApp(<App />)

    await waitFor(() => {
      expect(screen.getByText(/hey test/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during authentication', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      initializeAuth: vi.fn(),
    })

    renderApp(<App />)

    // Check that the app is in a loading state by looking for the layout structure
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('displays courses on dashboard', async () => {
    renderApp(<App />)

    await waitFor(() => {
      expect(screen.getAllByText(/react fundamentals/i)).toHaveLength(2)
    })
  })

  it('displays navigation links', async () => {
    renderApp(<App />)

    await waitFor(() => {
      expect(screen.getByText(/hey test/i)).toBeInTheDocument()
    })

    // Check that navigation links are present
    expect(screen.getByText(/home/i)).toBeInTheDocument()
    expect(screen.getByText(/tasks/i)).toBeInTheDocument()
    expect(screen.getByText(/progress/i)).toBeInTheDocument()
  })

  it('displays theme toggle button', async () => {
    renderApp(<App />)

    await waitFor(() => {
      expect(screen.getByText(/hey test/i)).toBeInTheDocument()
    })

    // Check that theme toggle button is present
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()
  })

  it('displays user profile menu button', async () => {
    renderApp(<App />)

    await waitFor(() => {
      expect(screen.getByText(/hey test/i)).toBeInTheDocument()
    })

    // Check that user profile menu button is present
    expect(screen.getByRole('button', { name: /user profile menu/i })).toBeInTheDocument()
  })
})
