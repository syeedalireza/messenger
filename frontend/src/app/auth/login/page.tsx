/**
 * @fileoverview Login page
 * @description User login form
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.emailOrUsername, data.password);
      router.push('/chat');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">
            Welcome back
          </h1>
          <p className="text-light-muted dark:text-dark-muted mt-2">
            Sign in to continue to Messenger
          </p>
        </div>

        {/* Form */}
        <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 shadow-lg border border-light-border dark:border-dark-border">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email/Username */}
            <div>
              <label
                htmlFor="emailOrUsername"
                className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5"
              >
                Email or Username
              </label>
              <input
                {...register('emailOrUsername')}
                type="text"
                id="emailOrUsername"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border bg-light-bg dark:bg-dark-bg',
                  'text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.emailOrUsername
                    ? 'border-red-500'
                    : 'border-light-border dark:border-dark-border'
                )}
                placeholder="Enter your email or username"
              />
              {errors.emailOrUsername && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.emailOrUsername.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={cn(
                    'w-full px-4 py-3 pr-12 rounded-xl border bg-light-bg dark:bg-dark-bg',
                    'text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500',
                    errors.password
                      ? 'border-red-500'
                      : 'border-light-border dark:border-dark-border'
                  )}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3 px-4 rounded-xl font-medium text-white',
                'bg-primary-500 hover:bg-primary-600',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-light-muted dark:text-dark-muted">
            Don't have an account?{' '}
            <Link
              href="/auth/register"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
