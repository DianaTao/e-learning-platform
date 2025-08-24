import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useThemeStore } from '../themeStore'

// Mock document methods
const mockDocumentElement = {
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(),
  },
}
Object.defineProperty(document, 'documentElement', {
  value: mockDocumentElement,
  writable: true,
})

describe('themeStore', () => {
  beforeEach(() => {
    // Reset store state
    useThemeStore.setState({
      theme: 'system',
      isDark: false,
    })
    vi.clearAllMocks()
  })

  it('initializes with system theme by default', () => {
    const state = useThemeStore.getState()
    expect(state.theme).toBe('system')
  })

  it('sets theme and updates DOM', () => {
    const { setTheme } = useThemeStore.getState()
    
    setTheme('dark')

    const state = useThemeStore.getState()
    expect(state.theme).toBe('dark')
    expect(state.isDark).toBe(true)
    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark')
  })

  it('removes dark class when setting light theme', () => {
    const { setTheme } = useThemeStore.getState()
    
    setTheme('light')

    const state = useThemeStore.getState()
    expect(state.theme).toBe('light')
    expect(state.isDark).toBe(false)
    expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark')
  })

  it('resolves system theme based on media query', () => {
    // Mock dark mode preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('dark'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const { setTheme } = useThemeStore.getState()
    
    setTheme('system')

    const state = useThemeStore.getState()
    expect(state.theme).toBe('system')
    expect(state.isDark).toBe(true)
    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark')
  })

  it('toggles between light and dark themes', () => {
    const { toggleTheme } = useThemeStore.getState()
    
    // Start with light theme
    useThemeStore.setState({ theme: 'light', isDark: false })
    
    toggleTheme()
    
    let state = useThemeStore.getState()
    expect(state.theme).toBe('dark')
    expect(state.isDark).toBe(true)

    toggleTheme()
    
    state = useThemeStore.getState()
    expect(state.theme).toBe('light')
    expect(state.isDark).toBe(false)
  })

  it('falls back to system theme when localStorage is empty', () => {
    // Mock empty localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    })
    
    const { initializeTheme } = useThemeStore.getState()
    initializeTheme()

    const state = useThemeStore.getState()
    expect(state.theme).toBe('system')
  })

  it('handles invalid theme values in localStorage', () => {
    // Mock invalid localStorage value
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn().mockReturnValue('invalid-theme'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    })
    
    const { initializeTheme } = useThemeStore.getState()
    initializeTheme()

    const state = useThemeStore.getState()
    expect(state.theme).toBe('system')
  })

  it('updates isDark when system preference changes', () => {
    // Set system theme
    const { setTheme } = useThemeStore.getState()
    setTheme('system')

    // Mock light mode preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false, // light mode
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    // Re-apply system theme
    setTheme('system')

    const state = useThemeStore.getState()
    expect(state.isDark).toBe(false)
    expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark')
  })

  it('toggles from system to opposite of current system preference', () => {
    // Mock dark mode preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('dark'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const { toggleTheme } = useThemeStore.getState()
    
    // Start with system theme (dark mode)
    useThemeStore.setState({ theme: 'system', isDark: true })
    
    toggleTheme()
    
    const state = useThemeStore.getState()
    expect(state.theme).toBe('light')
    expect(state.isDark).toBe(false)
  })
})
