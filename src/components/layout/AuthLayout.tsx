import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
                <span className="text-xl font-bold text-white">P</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                PhotoStory Pro
              </span>
            </Link>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating Circles */}
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative flex h-full flex-col items-center justify-center px-12 text-center">
            <div className="mb-8 flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-16 w-16 overflow-hidden rounded-full border-4 border-white/20 bg-gradient-to-br from-purple-400/50 to-pink-400/50 shadow-lg"
                  style={{
                    transform: `rotate(${(i - 3) * 5}deg)`,
                    zIndex: 5 - Math.abs(i - 3),
                  }}
                />
              ))}
            </div>

            <h2 className="mb-4 text-3xl font-bold text-white">
              추억을 아름다운 영상으로
            </h2>
            <p className="max-w-md text-lg text-white/80">
              AI가 당신의 사진을 분석하고, 감동적인 스토리텔링으로 영상을
              자동으로 만들어 드립니다.
            </p>

            {/* Feature Pills */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {['AI 나레이션', '50+ 테마', '20+ 전환효과', '배경음악'].map(
                (feature) => (
                  <span
                    key={feature}
                    className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
                  >
                    {feature}
                  </span>
                )
              )}
            </div>

            {/* Testimonial */}
            <div className="mt-12 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <p className="italic text-white/90">
                &ldquo;딸의 돌잔치 영상을 만들었는데, 가족들 모두 눈물을 흘렸어요.
                정말 감동적이었습니다.&rdquo;
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20" />
                <div className="text-left">
                  <p className="font-medium text-white">김민수</p>
                  <p className="text-sm text-white/70">서울, 대한민국</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
