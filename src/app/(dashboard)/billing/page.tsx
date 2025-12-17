'use client';

import React from 'react';
import { MainLayout } from '@/components/layout';
import { Card } from '@/components/common';
import { Crown, Check, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '무료',
    description: '개인 사용자를 위한 기본 플랜',
    features: [
      '월 3개 프로젝트',
      '720p 영상 품질',
      '10GB 저장공간',
      '기본 테마',
      '워터마크 포함',
    ],
    current: true,
  },
  {
    name: 'Pro',
    price: '₩9,900/월',
    description: '더 많은 기능이 필요한 분들을 위한 플랜',
    features: [
      '무제한 프로젝트',
      '4K 영상 품질',
      '100GB 저장공간',
      '모든 테마 사용',
      '워터마크 제거',
      'AI 나레이션',
      '공동작업',
      '우선 렌더링',
    ],
    recommended: true,
  },
  {
    name: 'Business',
    price: '₩29,900/월',
    description: '팀과 비즈니스를 위한 플랜',
    features: [
      'Pro의 모든 기능',
      '무제한 저장공간',
      '팀 관리',
      'API 접근',
      '전용 지원',
      '맞춤 브랜딩',
    ],
  },
];

export default function BillingPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">요금제</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            더 많은 기능을 원하시면 PRO로 업그레이드하세요
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden p-6 ${
                plan.recommended ? 'border-2 border-purple-500' : ''
              }`}
            >
              {plan.recommended && (
                <div className="absolute right-0 top-0 rounded-bl-lg bg-purple-600 px-3 py-1 text-xs font-bold text-white">
                  추천
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h2>
                  {plan.name === 'Pro' && <Crown className="h-5 w-5 text-amber-500" />}
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</p>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
              </div>

              <ul className="mb-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full rounded-lg py-2.5 font-medium ${
                  plan.current
                    ? 'border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300'
                    : plan.recommended
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'border border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
                disabled={plan.current}
              >
                {plan.current ? '현재 플랜' : '업그레이드'}
              </button>
            </Card>
          ))}
        </div>

        {/* Current Usage */}
        <Card className="mx-auto mt-8 max-w-2xl p-6">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">현재 사용량</h3>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">저장공간</span>
                <span className="text-gray-900 dark:text-white">2.4GB / 10GB</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-purple-600"
                  style={{ width: '24%' }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">이번 달 프로젝트</span>
                <span className="text-gray-900 dark:text-white">2 / 3</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-purple-600"
                  style={{ width: '66%' }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
