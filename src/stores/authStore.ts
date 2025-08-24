import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginForm, RegisterForm } from '@/types';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginForm) => {
        set({ isLoading: true, error: null });
        
        try {
          // For development, use mock data
          if (true) { // Development mode
            // Simulate quick login
            await new Promise(resolve => setTimeout(resolve, 200));
            
            if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
              const mockUser: User = {
                id: 'user-1',
                email: 'demo@example.com',
                firstName: 'Alex',
                lastName: 'Student',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
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
              };
              
              // Store tokens
              localStorage.setItem('accessToken', 'mock-access-token');
              if (credentials.rememberMe) {
                localStorage.setItem('refreshToken', 'mock-refresh-token');
              }
              
              set({ 
                user: mockUser, 
                isAuthenticated: true, 
                isLoading: false,
                error: null 
              });
            } else {
              throw new Error('Invalid email or password');
            }
          } else {
            // Production API call
            const response = await api.auth.login(credentials);
            const { user, accessToken, refreshToken } = response.data;
            
            localStorage.setItem('accessToken', accessToken);
            if (credentials.rememberMe) {
              localStorage.setItem('refreshToken', refreshToken);
            }
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ error: message, isLoading: false });
        }
      },

      register: async (userData: RegisterForm) => {
        set({ isLoading: true, error: null });
        
        try {
          // For development, use mock data
          if (true) { // Development mode
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const mockUser: User = {
              id: 'user-2',
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              preferences: {
                notifications: true,
                studyTimeReminders: true,
                preferredStudyTime: 'evening',
                timezone: 'America/New_York',
              },
              enrollmentDate: new Date('2024-01-01'),
              lastLoginDate: new Date(),
              streak: {
                current: 1,
                longest: 1,
                lastActivityDate: new Date(),
              },
            };
            
            localStorage.setItem('accessToken', 'mock-access-token');
            localStorage.setItem('refreshToken', 'mock-refresh-token');
            
            set({ 
              user: mockUser, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
          } else {
            // Production API call
            const response = await api.auth.register(userData);
            const { user, accessToken, refreshToken } = response.data;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed';
          set({ error: message, isLoading: false });
        }
      },

      logout: () => {
        // Clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Clear API call (don't await in dev mode)
        if (!import.meta.env.DEV) {
          api.auth.logout().catch(console.error);
        }
        
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: () => {
        // In development, auto-login with mock user
        if (true) { // Development mode
          const mockUser: User = {
            id: 'user-1',
            email: 'demo@example.com',
            firstName: 'Alex',
            lastName: 'Student',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
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
          };
          
          // Auto-login for development
          localStorage.setItem('accessToken', 'mock-access-token');
          set({ 
            user: mockUser, 
            isAuthenticated: true 
          });
        } else {
          const token = localStorage.getItem('accessToken');
          if (token) {
            // In production, validate token and get user data
            api.user.getProfile()
              .then(response => {
                set({ 
                  user: response.data, 
                  isAuthenticated: true 
                });
              })
              .catch(() => {
                // Token is invalid, clear it
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({ 
                  user: null, 
                  isAuthenticated: false 
                });
              });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
