'use client';

import React from 'react';
import { MainLayout } from '@/components/layout';
import { Card } from '@/components/common';
import { Palette, Sparkles, Crown } from 'lucide-react';
import Link from 'next/link';

const themes = [
  { id: '1', name: '졸업식', category: '교육', color: 'from-blue-500 to-indigo-600', isPro: false },
  { id: '2', name: '결혼식', category: '가족', color: 'from-pink-500 to-rose-600', isPro: false },
  { id: '3', name: '생일파티', category: '가족', color: 'from-amber-500 to-orange-600', isPro: false },
  { id: '4', name: '회사소개', category: '비즈니스', color: 'from-gray-600 to-gray-800', isPro: false },
  { id: '5', name: '여행기록', category: '이벤트', color: 'from-teal-500 to-emerald-600', isPro: false },
  { id: '6', name: '콘서트', category: '이벤트', color: 'from-purple-500 to-violet-600', isPro: true },
  { id: '7', name: '아기성장', category: '가족', color: 'from-cyan-500 to-blue-600', isPro: false },
  { id: '8', name: '입학식', category: '교육', color: 'from-green-500 to-emerald-600', isPro: false },
  { id: '9', name: '기업 프레젠테이션', category: '비즈니스', color: 'from-slate-600 to-slate-800', isPro: true },
];

const categories = ['전체', '교육', '가족', '비즈니스', '이벤트'];

export default function ThemesPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">테마 선택</h1>
          <p className="text-gray-600 dark:text-gray-400">영상의 분위기에 맞는 테마를 선택하세요</p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                category === '전체'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {themes.map((theme) => (
            <Link key={theme.id} href={`/create?theme=${theme.id}`}>
              <Card hoverable className="group overflow-hidden">
                <div
                  className={`aspect-video bg-gradient-to-br ${theme.color} relative flex items-center justify-center`}
                >
                  <Sparkles className="h-12 w-12 text-white/80 transition-transform group-hover:scale-110" />
                  {theme.isPro && (
                    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                      <Crown className="h-3 w-3" />
                      PRO
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">{theme.name}</h3>
                  <p className="text-sm text-gray-500">{theme.category}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
