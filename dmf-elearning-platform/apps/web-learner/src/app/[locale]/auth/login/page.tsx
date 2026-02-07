'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers';
import Link from 'next/link';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await signIn(data.email, data.password);

      // Redirect to dashboard on successful login
      router.push('/dashboard');
    } catch (err: any) {
      // Handle Supabase error messages
      const errorMessage = err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cyan-50 via-cyan-100 to-blue-50">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main container */}
      <div className="relative w-full max-w-md">
        {/* Glassmorphism card */}
        <div className="backdrop-blur-md bg-white/60 rounded-2xl border border-white/20 shadow-2xl p-8 sm:p-10">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold text-cyan-900 mb-2 font-outfit">
              Chào mừng trở lại
            </h1>
            <p className="text-cyan-700/80 text-sm font-inter">
              Đăng nhập để tiếp tục học tập cùng DMF Elearning
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-cyan-900 mb-2 font-inter"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email là bắt buộc',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không hợp lệ',
                  },
                })}
                className={`
                  w-full h-11 px-4 rounded-lg
                  bg-white/50 backdrop-blur-sm
                  border ${errors.email ? 'border-red-400' : 'border-white/30'}
                  text-cyan-900 placeholder-cyan-600/50
                  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                  transition-all duration-200
                  hover:bg-white/60
                `}
                placeholder="your.email@example.com"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-cyan-900 mb-2 font-inter"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password', {
                  required: 'Mật khẩu là bắt buộc',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự',
                  },
                })}
                className={`
                  w-full h-11 px-4 rounded-lg
                  bg-white/50 backdrop-blur-sm
                  border ${errors.password ? 'border-red-400' : 'border-white/30'}
                  text-cyan-900 placeholder-cyan-600/50
                  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                  transition-all duration-200
                  hover:bg-white/60
                `}
                placeholder="••••••••"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <p id="password-error" className="mt-1.5 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-4 h-4 rounded border-cyan-300 text-cyan-600 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 text-sm text-cyan-800 cursor-pointer font-inter"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-cyan-700 hover:text-cyan-900 transition-colors duration-200 font-inter"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full h-11 px-4 rounded-lg
                bg-gradient-to-r from-green-500 to-green-600
                text-white font-medium text-base
                hover:from-green-600 hover:to-green-700
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                shadow-lg hover:shadow-xl
                cursor-pointer
                font-outfit
              "
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-cyan-700 font-inter">
              Chưa có tài khoản?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-cyan-600 hover:text-cyan-800 transition-colors duration-200"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Footer text */}
        <p className="mt-6 text-center text-xs text-cyan-700/60 font-inter">
          Bằng cách đăng nhập, bạn đồng ý với{' '}
          <Link href="/terms" className="underline hover:text-cyan-900">
            Điều khoản dịch vụ
          </Link>{' '}
          và{' '}
          <Link href="/privacy" className="underline hover:text-cyan-900">
            Chính sách bảo mật
          </Link>
        </p>
      </div>
    </div>
  );
}
