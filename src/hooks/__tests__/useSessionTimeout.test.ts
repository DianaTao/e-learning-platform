import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSessionTimeout } from '../useSessionTimeout'

// Mock the auth store
const mockLogout = vi.fn()
const mockUseAuthStore = vi.fn()

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}))

describe('useSessionTimeout', () => {
  const mockOnWarning = vi.fn()
  const mockOnTimeout = vi.fn()

  const defaultOptions = {
    timeoutMinutes: 30,
    warningMinutes: 5,
    onWarning: mockOnWarning,
    onTimeout: mockOnTimeout,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    // Mock authenticated state by default
    mockUseAuthStore.mockReturnValue({
      logout: mockLogout,
      isAuthenticated: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with correct remaining time', () => {
    const { result } = renderHook(() => useSessionTimeout(defaultOptions))

    const remainingTime = result.current.getRemainingTime()
    expect(remainingTime).toBe(30 * 60 * 1000) // 30 minutes in milliseconds
  })

  it('resets timer when resetTimer is called', () => {
    const { result } = renderHook(() => useSessionTimeout(defaultOptions))

    // Advance time by 10 minutes
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000)
    })

    // Reset timer
    act(() => {
      result.current.resetTimer()
    })

    const remainingTime = result.current.getRemainingTime()
    expect(remainingTime).toBe(30 * 60 * 1000) // Should be back to 30 minutes
  })

  it('calls onWarning when warning threshold is reached', () => {
    renderHook(() => useSessionTimeout(defaultOptions))

    // Advance time to warning threshold (25 minutes)
    act(() => {
      vi.advanceTimersByTime(25 * 60 * 1000)
    })

    expect(mockOnWarning).toHaveBeenCalledTimes(1)
  })

  it('calls onTimeout when session expires', () => {
    renderHook(() => useSessionTimeout(defaultOptions))

    // Advance time to timeout (30 minutes)
    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000)
    })

    expect(mockOnTimeout).toHaveBeenCalledTimes(1)
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('does not call onWarning multiple times', () => {
    renderHook(() => useSessionTimeout(defaultOptions))

    // Advance time past warning threshold
    act(() => {
      vi.advanceTimersByTime(25 * 60 * 1000)
    })

    // Advance more time
    act(() => {
      vi.advanceTimersByTime(2 * 60 * 1000)
    })

    expect(mockOnWarning).toHaveBeenCalledTimes(1)
  })

  it('resets activity on user events', () => {
    const { result } = renderHook(() => useSessionTimeout(defaultOptions))

    // Advance time by 10 minutes
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000)
    })

    // Simulate user activity (mouse movement)
    act(() => {
      const mouseMoveEvent = new MouseEvent('mousemove')
      document.dispatchEvent(mouseMoveEvent)
    })

    const remainingTime = result.current.getRemainingTime()
    expect(remainingTime).toBe(30 * 60 * 1000) // Should be reset to 30 minutes
  })

  it('resets activity on keyboard events', () => {
    const { result } = renderHook(() => useSessionTimeout(defaultOptions))

    // Advance time by 10 minutes
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000)
    })

    // Simulate user activity (key press)
    act(() => {
      const keyPressEvent = new KeyboardEvent('keypress')
      document.dispatchEvent(keyPressEvent)
    })

    const remainingTime = result.current.getRemainingTime()
    expect(remainingTime).toBe(30 * 60 * 1000) // Should be reset to 30 minutes
  })

  it('resets activity on click events', () => {
    const { result } = renderHook(() => useSessionTimeout(defaultOptions))

    // Advance time by 10 minutes
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000)
    })

    // Simulate user activity (click)
    act(() => {
      const clickEvent = new MouseEvent('click')
      document.dispatchEvent(clickEvent)
    })

    const remainingTime = result.current.getRemainingTime()
    expect(remainingTime).toBe(30 * 60 * 1000) // Should be reset to 30 minutes
  })

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
    
    const { unmount } = renderHook(() => useSessionTimeout(defaultOptions))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function), true)
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keypress', expect.any(Function), true)
    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), true)
  })

  it('handles custom timeout and warning durations', () => {
    const customOptions = {
      timeoutMinutes: 60,
      warningMinutes: 10,
      onWarning: mockOnWarning,
      onTimeout: mockOnTimeout,
    }

    const { result } = renderHook(() => useSessionTimeout(customOptions))

    const remainingTime = result.current.getRemainingTime()
    expect(remainingTime).toBe(60 * 60 * 1000) // 60 minutes in milliseconds

    // Advance to warning threshold (50 minutes)
    act(() => {
      vi.advanceTimersByTime(50 * 60 * 1000)
    })

    expect(mockOnWarning).toHaveBeenCalledTimes(1)

    // Advance to timeout (60 minutes)
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000)
    })

    expect(mockOnTimeout).toHaveBeenCalledTimes(1)
  })

  it('returns correct remaining time throughout session', () => {
    const { result } = renderHook(() => useSessionTimeout(defaultOptions))

    // Initially 30 minutes
    expect(result.current.getRemainingTime()).toBe(30 * 60 * 1000)

    // After 10 minutes
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000)
    })
    expect(result.current.getRemainingTime()).toBe(20 * 60 * 1000)

    // After another 15 minutes (25 total)
    act(() => {
      vi.advanceTimersByTime(15 * 60 * 1000)
    })
    expect(result.current.getRemainingTime()).toBe(5 * 60 * 1000)
  })

  it('does not start timers when not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      logout: mockLogout,
      isAuthenticated: false,
    })

    renderHook(() => useSessionTimeout(defaultOptions))

    // Advance time - should not trigger any callbacks
    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000)
    })

    expect(mockOnWarning).not.toHaveBeenCalled()
    expect(mockOnTimeout).not.toHaveBeenCalled()
    expect(mockLogout).not.toHaveBeenCalled()
  })
})
