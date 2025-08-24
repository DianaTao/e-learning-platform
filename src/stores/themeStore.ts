import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const getSystemTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyTheme = (isDark: boolean) => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      isDark: false,

      setTheme: (theme: Theme) => {
        let isDark = false;
        
        if (theme === 'dark') {
          isDark = true;
        } else if (theme === 'light') {
          isDark = false;
        } else {
          isDark = getSystemTheme();
        }

        applyTheme(isDark);
        set({ theme, isDark });
      },

      toggleTheme: () => {
        const { theme } = get();
        if (theme === 'system') {
          // If currently system, switch to opposite of current system preference
          const systemIsDark = getSystemTheme();
          get().setTheme(systemIsDark ? 'light' : 'dark');
        } else {
          // Toggle between light and dark
          get().setTheme(theme === 'light' ? 'dark' : 'light');
        }
      },

      initializeTheme: () => {
        const { theme } = get();
        
        // Set up system preference listener
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          
          const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            const { theme: currentTheme } = get();
            if (currentTheme === 'system') {
              applyTheme(e.matches);
              set({ isDark: e.matches });
            }
          };
          
          mediaQuery.addEventListener('change', handleSystemThemeChange);
        }
        
        // Apply initial theme
        get().setTheme(theme);
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
