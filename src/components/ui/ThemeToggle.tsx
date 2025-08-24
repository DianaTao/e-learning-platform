import React, { useRef, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';

export const ThemeToggle: React.FC = () => {
  const { theme, isDark, setTheme } = useThemeStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const themes = [
    { key: 'light' as const, icon: Sun, label: 'Light' },
    { key: 'dark' as const, icon: Moon, label: 'Dark' },
    { key: 'system' as const, icon: Monitor, label: 'System' },
  ];

  const handleKeyDown = (event: React.KeyboardEvent, themeKey: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setTheme(themeKey as 'light' | 'dark' | 'system');
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const currentIndex = themes.findIndex(t => t.key === theme);
      let nextIndex;
      
      if (event.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % themes.length;
      } else {
        nextIndex = currentIndex === 0 ? themes.length - 1 : currentIndex - 1;
      }
      
      setTheme(themes[nextIndex].key);
      
      // Focus the new active button
      const buttons = containerRef.current?.querySelectorAll('button');
      if (buttons) {
        (buttons[nextIndex] as HTMLButtonElement).focus();
      }
    }
  };

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 transition-colors duration-200"
        role="radiogroup"
        aria-label="Theme selection"
      >
        {themes.map(({ key, icon: Icon, label }, index) => (
          <button
            key={key}
            onClick={() => setTheme(key)}
            onKeyDown={(e) => handleKeyDown(e, key)}
            className={`
              relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
              ${theme === key 
                ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }
            `}
            title={`${label} theme`}
            aria-label={`Switch to ${label.toLowerCase()} theme`}
            role="radio"
            aria-checked={theme === key}
            tabIndex={theme === key ? 0 : -1}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </div>
  );
};

export const SimpleThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useThemeStore();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTheme();
    }
  };

  return (
    <button
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
      className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            isDark 
              ? 'rotate-90 scale-0 opacity-0' 
              : 'rotate-0 scale-100 opacity-100'
          }`} 
        />
        <Moon 
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            isDark 
              ? 'rotate-0 scale-100 opacity-100' 
              : '-rotate-90 scale-0 opacity-0'
          }`} 
        />
      </div>
    </button>
  );
};
