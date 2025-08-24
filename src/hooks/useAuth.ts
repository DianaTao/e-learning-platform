import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi, useMutation } from './useApi';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import type { User, LoginForm, RegisterForm } from '@/types';

/**
 * Hook for authentication operations
 */
export function useAuth() {
  const navigate = useNavigate();
  const { user, setUser, setTokens, clearAuth, isAuthenticated } = useAuthStore();
  const { addToast } = useAppStore();

  // Login mutation
  const loginMutation = useMutation(
    async (credentials: LoginForm) => {
      const response = await apiClient.post('/auth/login', credentials);
      return response;
    },
    {
      onSuccess: (data) => {
        setTokens(data.accessToken, data.refreshToken);
        setUser(data.user);
        addToast({
          type: 'success',
          message: `Welcome back, ${data.user.firstName}!`,
          duration: 3000
        });
        navigate('/dashboard');
      },
      onError: () => {
        addToast({
          type: 'error',
          message: 'Invalid email or password. Please try again.',
          duration: 5000
        });
      }
    }
  );

  // Register mutation
  const registerMutation = useMutation(
    async (userData: RegisterForm) => {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    },
    {
      onSuccess: (data) => {
        addToast({
          type: 'success',
          message: 'Account created successfully! Please check your email for verification.',
          duration: 5000
        });
      }
    }
  );

  // Logout mutation
  const logoutMutation = useMutation(
    async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        // Continue with logout even if API call fails
        console.warn('Logout API call failed:', error);
      }
      return true;
    },
    {
      onSuccess: () => {
        clearAuth();
        navigate('/auth');
        addToast({
          type: 'info',
          message: 'You have been logged out successfully.',
          duration: 3000
        });
      }
    }
  );

  // Refresh token
  const refreshTokenMutation = useMutation(
    async (refreshToken: string) => {
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      return response;
    },
    {
      onSuccess: (data) => {
        setTokens(data.accessToken, data.refreshToken);
      },
      onError: () => {
        // If refresh fails, logout user
        clearAuth();
        navigate('/auth');
        addToast({
          type: 'warning',
          message: 'Your session has expired. Please log in again.',
          duration: 5000
        });
      }
    }
  );

  // Fetch current user profile
  const {
    data: currentUser,
    loading: loadingProfile,
    error: profileError,
    execute: fetchProfile,
    refresh: refreshProfile
  } = useApi(
    async () => {
      const response = await apiClient.get('/me');
      return response as User;
    },
    {
      immediate: false,
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onSuccess: (userData) => {
        setUser(userData);
      }
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    async (updates: Partial<User>) => {
      const response = await apiClient.patch('/me', updates);
      return response as User;
    },
    {
      optimisticUpdate: (updates) => ({
        ...user,
        ...updates
      } as User),
      onSuccess: (updatedUser) => {
        setUser(updatedUser);
        addToast({
          type: 'success',
          message: 'Profile updated successfully!',
          duration: 3000
        });
      }
    }
  );

  // Change password mutation
  const changePasswordMutation = useMutation(
    async (passwordData: { currentPassword: string; newPassword: string }) => {
      await apiClient.patch('/me/password', passwordData);
      return true;
    },
    {
      onSuccess: () => {
        addToast({
          type: 'success',
          message: 'Password changed successfully!',
          duration: 3000
        });
      }
    }
  );

  // Forgot password
  const forgotPasswordMutation = useMutation(
    async (email: string) => {
      await apiClient.post('/auth/password/forgot', { email });
      return true;
    },
    {
      onSuccess: () => {
        addToast({
          type: 'success',
          message: 'Password reset instructions have been sent to your email.',
          duration: 5000
        });
      }
    }
  );

  // Reset password
  const resetPasswordMutation = useMutation(
    async (data: { token: string; newPassword: string }) => {
      await apiClient.post('/auth/password/reset', data);
      return true;
    },
    {
      onSuccess: () => {
        addToast({
          type: 'success',
          message: 'Password reset successfully! You can now log in with your new password.',
          duration: 5000
        });
        navigate('/auth');
      }
    }
  );

  // Verify email
  const verifyEmailMutation = useMutation(
    async (token: string) => {
      await apiClient.post('/auth/verify-email', { token });
      return true;
    },
    {
      onSuccess: () => {
        addToast({
          type: 'success',
          message: 'Email verified successfully!',
          duration: 3000
        });
        fetchProfile(); // Refresh user data
      }
    }
  );

  // Resend verification email
  const resendVerificationMutation = useMutation(
    async () => {
      await apiClient.post('/auth/resend-verification');
      return true;
    },
    {
      onSuccess: () => {
        addToast({
          type: 'success',
          message: 'Verification email sent! Please check your inbox.',
          duration: 5000
        });
      }
    }
  );

  // Convenient functions
  const login = useCallback((credentials: LoginForm) => {
    return loginMutation.mutate(credentials);
  }, [loginMutation.mutate]);

  const register = useCallback((userData: RegisterForm) => {
    return registerMutation.mutate(userData);
  }, [registerMutation.mutate]);

  const logout = useCallback(() => {
    return logoutMutation.mutate(undefined);
  }, [logoutMutation.mutate]);

  const updateProfile = useCallback((updates: Partial<User>) => {
    return updateProfileMutation.mutate(updates);
  }, [updateProfileMutation.mutate]);

  const changePassword = useCallback((passwordData: { currentPassword: string; newPassword: string }) => {
    return changePasswordMutation.mutate(passwordData);
  }, [changePasswordMutation.mutate]);

  const forgotPassword = useCallback((email: string) => {
    return forgotPasswordMutation.mutate(email);
  }, [forgotPasswordMutation.mutate]);

  const resetPassword = useCallback((data: { token: string; newPassword: string }) => {
    return resetPasswordMutation.mutate(data);
  }, [resetPasswordMutation.mutate]);

  const verifyEmail = useCallback((token: string) => {
    return verifyEmailMutation.mutate(token);
  }, [verifyEmailMutation.mutate]);

  const resendVerification = useCallback(() => {
    return resendVerificationMutation.mutate(undefined);
  }, [resendVerificationMutation.mutate]);

  const refreshToken = useCallback((token: string) => {
    return refreshTokenMutation.mutate(token);
  }, [refreshTokenMutation.mutate]);

  return {
    // State
    user: updateProfileMutation.data || user,
    isAuthenticated,
    currentUser,
    
    // Loading states
    isLoggingIn: loginMutation.loading,
    isRegistering: registerMutation.loading,
    isLoggingOut: logoutMutation.loading,
    isUpdatingProfile: updateProfileMutation.loading,
    isChangingPassword: changePasswordMutation.loading,
    isForgettingPassword: forgotPasswordMutation.loading,
    isResettingPassword: resetPasswordMutation.loading,
    isVerifyingEmail: verifyEmailMutation.loading,
    isResendingVerification: resendVerificationMutation.loading,
    isRefreshingToken: refreshTokenMutation.loading,
    loadingProfile,

    // Error states
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    profileError: updateProfileMutation.error || profileError,
    
    // Optimistic data
    isOptimisticProfile: updateProfileMutation.isOptimistic,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    refreshToken,
    fetchProfile,
    refreshProfile,
    
    // Raw mutations for advanced usage
    loginMutation,
    registerMutation,
    logoutMutation,
    updateProfileMutation,
    changePasswordMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
    verifyEmailMutation,
    resendVerificationMutation,
    refreshTokenMutation
  };
}
