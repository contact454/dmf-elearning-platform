'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setSuccess(false);

    if (!data.acceptTerms) {
      setError('Vui lòng đồng ý với điều khoản dịch vụ');
      return;
    }

    try {
      await signUp(data.email, data.password, { name: data.name });

      setSuccess(true);

      // Wait 2 seconds then redirect to login
      setTimeout(() => {
        router.push(`/${locale}/auth/login`);
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-50">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main container */}
      <div className="relative w-full max-w-md">
        {/* Glassmorphism card */}
        <div className="backdrop-blur-md bg-white/60 rounded-2xl border border-white/20 shadow-2xl p-8 sm:p-10">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold text-purple-900 mb-2 font-outfit">
              Tạo tài khoản mới
            </h1>
            <p className="text-purple-700/80 text-sm font-inter">
              Bắt đầu hành trình học tiếng Đức của bạn
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

          {/* Success Alert */}
          {success && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-6 p-4 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-lg"
            >
              <p className="text-sm text-green-800">
                Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.
              </p>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-purple-900 mb-2 font-inter"
              >
                Họ và tên
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                {...register('name', {
                  required: 'Họ và tên là bắt buộc',
                  minLength: {
                    value: 2,
                    message: 'Họ và tên phải có ít nhất 2 ký tự',
                  },
                })}
                className={`
                  w-full h-11 px-4 rounded-lg
                  bg-white/50 backdrop-blur-sm
                  border ${errors.name ? 'border-red-400' : 'border-white/30'}
                  text-purple-900 placeholder-purple-600/50
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                  transition-all duration-200
                  hover:bg-white/60
                `}
                placeholder="Nguyễn Văn A"
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1.5 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-purple-900 mb-2 font-inter"
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
                  text-purple-900 placeholder-purple-600/50
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
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
                className="block text-sm font-medium text-purple-900 mb-2 font-inter"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
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
                  text-purple-900 placeholder-purple-600/50
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
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

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-purple-900 mb-2 font-inter"
              >
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Vui lòng xác nhận mật khẩu',
                  validate: (value) =>
                    value === password || 'Mật khẩu không khớp',
                })}
                className={`
                  w-full h-11 px-4 rounded-lg
                  bg-white/50 backdrop-blur-sm
                  border ${
                    errors.confirmPassword ? 'border-red-400' : 'border-white/30'
                  }
                  text-purple-900 placeholder-purple-600/50
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                  transition-all duration-200
                  hover:bg-white/60
                `}
                placeholder="••••••••"
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                aria-describedby={
                  errors.confirmPassword ? 'confirmPassword-error' : undefined
                }
              />
              {errors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  className="mt-1.5 text-sm text-red-600"
                >
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Accept Terms */}
            <div className="flex items-start">
              <input
                id="acceptTerms"
                type="checkbox"
                {...register('acceptTerms', {
                  required: 'Bạn phải đồng ý với điều khoản dịch vụ',
                })}
                className="w-4 h-4 mt-0.5 rounded border-purple-300 text-purple-600 focus:ring-2 focus:ring-purple-500 cursor-pointer"
              />
              <label
                htmlFor="acceptTerms"
                className="ml-2 text-sm text-purple-800 cursor-pointer font-inter"
              >
                Tôi đồng ý với{' '}
                <Link
                  href={`/${locale}/terms`}
                  className="text-purple-600 hover:text-purple-900 underline"
                >
                  Điều khoản dịch vụ
                </Link>{' '}
                và{' '}
                <Link
                  href={`/${locale}/privacy`}
                  className="text-purple-600 hover:text-purple-900 underline"
                >
                  Chính sách bảo mật
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="
                w-full h-11 px-4 rounded-lg
                bg-gradient-to-r from-purple-500 to-pink-600
                text-white font-medium text-base
                hover:from-purple-600 hover:to-pink-700
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
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
              ) : success ? (
                'Đăng ký thành công!'
              ) : (
                'Đăng ký'
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-purple-200" />
            <span className="text-xs uppercase tracking-wide text-purple-700">Hoặc</span>
            <div className="h-px flex-1 bg-purple-200" />
          </div>

          <button
            type="button"
            onClick={() => signInWithGoogle(locale)}
            className="
              w-full h-11 px-4 rounded-lg
              bg-white border border-purple-200
              text-purple-900 font-medium text-sm
              hover:bg-purple-50
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
              transition-all duration-200
              cursor-pointer
              font-inter
            "
          >
            Đăng ký với Google
          </button>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-purple-700 font-inter">
              Đã có tài khoản?{' '}
              <Link
                href={`/${locale}/auth/login`}
                className="font-medium text-purple-600 hover:text-purple-800 transition-colors duration-200"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
