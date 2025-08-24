import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { LoginForm as LoginFormData } from '@/types';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading: isLoggingIn, error: loginError } = useAuthStore();
  const emailRef = useRef<HTMLInputElement>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: 'demo@example.com',
      password: 'demo123',
      rememberMe: false,
    },
  });

  // Focus email input on mount
  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  // Handle form keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Hey there! 👋</h2>
          <p className="text-gray-600 dark:text-gray-400">Ready to dive back into learning?</p>
        </div>

        {loginError && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-danger-600 text-sm">{loginError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-emerald-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 dark:text-cyan-400" />
              </div>
              <input
                ref={emailRef}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-blue-100 placeholder-gray-500 dark:placeholder-cyan-300 ${
                  errors.email ? 'border-danger-300 dark:border-red-500' : 'border-gray-300 dark:border-cyan-600'
                }`}
                placeholder="demo@example.com"
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-emerald-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-cyan-400" />
              </div>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                type={showPassword ? 'text' : 'password'}
                className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-blue-100 placeholder-gray-500 dark:placeholder-cyan-300 ${
                  errors.password ? 'border-danger-300 dark:border-red-500' : 'border-gray-300 dark:border-cyan-600'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-cyan-400 dark:hover:text-cyan-300" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-cyan-400 dark:hover:text-cyan-300" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                {...register('rememberMe')}
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-cyan-500 rounded bg-white dark:bg-gray-700"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-green-300">
                Remember me
              </label>
            </div>

            <button
              type="button"
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl"
          >
            {isLoggingIn ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Getting you in...
              </div>
            ) : (
              'Let\'s go! 🚀'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-pink-400 dark:hover:text-pink-300"
            >
              Sign up now
            </button>
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-slate-800 rounded-lg border dark:border-cyan-600">
          <p className="text-sm text-blue-700 dark:text-cyan-300 font-medium">Demo Credentials:</p>
          <p className="text-sm text-blue-600 dark:text-blue-300">Email: demo@example.com</p>
          <p className="text-sm text-blue-600 dark:text-blue-300">Password: demo123</p>
        </div>
      </div>
    </div>
  );
};
