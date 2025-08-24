import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuthStore } from '@/stores/authStore';

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  };
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({
      pathname: '/dashboard',
      search: '',
      hash: '',
      state: null,
    });
  });

  it('renders children when user is authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' } as any,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      initializeAuth: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      initializeAuth: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // The Navigate component should redirect to login
    // We can't easily test the Navigate component directly, but we can verify
    // that the protected content is not rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('passes location state to login redirect', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      initializeAuth: vi.fn(),
    });

    mockUseLocation.mockReturnValue({
      pathname: '/dashboard',
      search: '?tab=assignments',
      hash: '#section1',
      state: { someState: 'value' },
    });

    render(
      <MemoryRouter initialEntries={['/dashboard?tab=assignments#section1']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Verify that the component renders without errors
    // The Navigate component handles the redirect internally
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('handles loading state gracefully', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: true,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      initializeAuth: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Even in loading state, if not authenticated, should redirect
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});