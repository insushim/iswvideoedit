'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout';
import { Button, Input } from '@/components/common';
import { Mail, Lock, User, Eye, EyeOff, Check } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const passwordRequirements = [
    { label: '8자 이상', met: password.length >= 8 },
    { label: '영문 포함', met: /[a-zA-Z]/.test(password) },
    { label: '숫자 포함', met: /[0-9]/.test(password) },
    { label: '특수문자 포함', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.met);
  const doPasswordsMatch = password === confirmPassword && confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setError('비밀번호가 요구사항을 충족하지 않습니다.');
      return;
    }

    if (!doPasswordsMatch) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!agreedToTerms) {
      setError('이용약관에 동의해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        // Auto sign in after registration
        await signIn('credentials', {
          email,
          password,
          callbackUrl: '/dashboard',
        });
      } else {
        const data = await response.json();
        setError(data.error || '회원가입 중 오류가 발생했습니다.');
      }
    } catch (error) {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <AuthLayout
      title="회원가입"
      subtitle="무료로 시작하고 멋진 영상을 만들어보세요"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <Input
          label="이름"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          leftIcon={<User className="h-5 w-5" />}
          required
        />

        <Input
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          leftIcon={<Mail className="h-5 w-5" />}
          required
        />

        <div>
          <Input
            label="비밀번호"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="h-5 w-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
            required
          />
          {password && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {passwordRequirements.map((req) => (
                <div
                  key={req.label}
                  className={`flex items-center gap-1 text-xs ${
                    req.met
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400'
                  }`}
                >
                  <Check className="h-3 w-3" />
                  {req.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <Input
          label="비밀번호 확인"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="h-5 w-5" />}
          error={
            confirmPassword && !doPasswordsMatch
              ? '비밀번호가 일치하지 않습니다'
              : undefined
          }
          required
        />

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            <Link href="/terms" className="text-purple-600 hover:underline dark:text-purple-400">
              이용약관
            </Link>{' '}
            및{' '}
            <Link href="/privacy" className="text-purple-600 hover:underline dark:text-purple-400">
              개인정보처리방침
            </Link>
            에 동의합니다
          </span>
        </label>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          disabled={!agreedToTerms}
        >
          회원가입
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
              또는
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={handleGoogleSignIn}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 계속하기
        </Button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          이미 계정이 있으신가요?{' '}
          <Link
            href="/login"
            className="font-medium text-purple-600 hover:underline dark:text-purple-400"
          >
            로그인
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
