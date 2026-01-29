/**
 * @fileoverview Register page
 * @description User registration form
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

const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores'
      ),
    displayName: z.string().max(50, 'Display name must be at most 50 characters').optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      await registerUser({
        email: data.email,
        username: data.username,
        password: data.password,
        displayName: data.displayName,
      });
      router.push('/chat');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">
            Create account
          </h1>
          <p className="text-light-muted dark:text-dark-muted mt-2">
            Join Messenger today
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

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5"
              >
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border bg-light-bg dark:bg-dark-bg',
                  'text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.email
                    ? 'border-red-500'
                    : 'border-light-border dark:border-dark-border'
                )}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5"
              >
                Username
              </label>
              <input
                {...register('username')}
                type="text"
                id="username"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border bg-light-bg dark:bg-dark-bg',
                  'text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.username
                    ? 'border-red-500'
                    : 'border-light-border dark:border-dark-border'
                )}
                placeholder="johndoe"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5"
              >
                Display Name (optional)
              </label>
              <input
                {...register('displayName')}
                type="text"
                id="displayName"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border bg-light-bg dark:bg-dark-bg',
                  'text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  'border-light-border dark:border-dark-border'
                )}
                placeholder="John Doe"
              />
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
                  placeholder="Min. 8 characters"
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
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5"
              >
                Confirm Password
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                id="confirmPassword"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border bg-light-bg dark:bg-dark-bg',
                  'text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.confirmPassword
                    ? 'border-red-500'
                    : 'border-light-border dark:border-dark-border'
                )}
                placeholder="Repeat password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword.message}
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
                'Create Account'
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-light-muted dark:text-dark-muted">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
