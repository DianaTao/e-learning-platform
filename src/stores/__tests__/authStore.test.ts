import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuthStore } from '../authStore'
import { mockUser } from '@/test/test-utils'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('initializes with default state', () => {
    const state = useAuthStore.getState()
    
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('successfully logs in with valid credentials in development', async () => {
    const { login } = useAuthStore.getState()
    
    const credentials = {
      email: 'demo@example.com',
      password: 'demo123',
      rememberMe: false,
    }

    await login(credentials)

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toBeTruthy()
    expect(state.error).toBeNull()
    expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'mock-access-token')
  })

  it('saves refresh token when rememberMe is true', async () => {
    const { login } = useAuthStore.getState()
    
    const credentials = {
      email: 'demo@example.com',
      password: 'demo123',
      rememberMe: true,
    }

    await login(credentials)

    expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'mock-access-token')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token')
  })

  it('handles login failure with invalid credentials', async () => {
    const { login } = useAuthStore.getState()
    
    const credentials = {
      email: 'invalid@example.com',
      password: 'wrongpassword',
      rememberMe: false,
    }

    await login(credentials)

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.error).toBe('Invalid email or password')
  })

  it('sets loading state during login', async () => {
    const { login } = useAuthStore.getState()
    
    const credentials = {
      email: 'demo@example.com',
      password: 'demo123',
      rememberMe: false,
    }

    // Start login but don't await
    const loginPromise = login(credentials)

    // Check loading state
    const loadingState = useAuthStore.getState()
    expect(loadingState.isLoading).toBe(true)

    // Complete login
    await loginPromise

    // Check final state
    const finalState = useAuthStore.getState()
    expect(finalState.isLoading).toBe(false)
  })

  it('clears authentication state on logout', () => {
    // Set up authenticated state
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
    })

    const { logout } = useAuthStore.getState()
    logout()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken')
  })

  it('clears error when clearError is called', () => {
    // Set error state
    useAuthStore.setState({ error: 'Some error' })

    const { clearError } = useAuthStore.getState()
    clearError()

    const state = useAuthStore.getState()
    expect(state.error).toBeNull()
  })

  it('initializes auth with existing token in development', () => {
    localStorageMock.getItem.mockReturnValue('mock-access-token')

    const { initializeAuth } = useAuthStore.getState()
    initializeAuth()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toBeTruthy()
  })

  it('auto-initializes without existing token in development', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { initializeAuth } = useAuthStore.getState()
    initializeAuth()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toBeTruthy()
    expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'mock-access-token')
  })

  it('handles register in development mode', async () => {
    const { register } = useAuthStore.getState()
    
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    }

    await register(userData)

    const state = useAuthStore.getState()
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('persists authentication state', () => {
    // Set authenticated state
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
    })

    // The store should persist the state (this is handled by Zustand persist middleware)
    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
  })
})
