'use client';

import React from 'react';
import { MainLayout } from '@/components/layout';
import { Card } from '@/components/common';
import { Mic, Play, Volume2, Crown, Sparkles } from 'lucide-react';

const voices = [
  { id: '1', name: '서연 (여성)', language: '한국어', sample: '따뜻하고 친근한 목소리', isPro: false },
  { id: '2', name: '민준 (남성)', language: '한국어', sample: '차분하고 신뢰감 있는 목소리', isPro: false },
  { id: '3', name: '지우 (여성)', language: '한국어', sample: '밝고 활기찬 목소리', isPro: true },
  { id: '4', name: '현우 (남성)', language: '한국어', sample: '깊고 웅장한 목소리', isPro: true },
];

export default function NarrationPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">나레이션</h1>
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-xs font-bold text-white">
              <Crown className="h-3 w-3" />
              PRO
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">AI가 생성한 스토리를 목소리로 들려드립니다</p>
        </div>

        {/* AI Narration Feature */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-white/20 p-3">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI 자동 나레이션</h2>
                <p className="mt-1 text-white/80">
                  사진을 분석하여 AI가 자동으로 감동적인 스토리를 작성하고,
                  선택한 목소리로 나레이션을 생성합니다.
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="mb-4 font-medium text-gray-900 dark:text-white">목소리 선택</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {voices.map((voice) => (
                <div
                  key={voice.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 hover:border-purple-500 dark:border-gray-700"
                >
                  <button className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">
                    <Play className="h-5 w-5" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{voice.name}</h4>
                      {voice.isPro && (
                        <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                          <Crown className="h-3 w-3" />
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{voice.sample}</p>
                  </div>
                  <input type="radio" name="voice" className="h-5 w-5 text-purple-600" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Custom Text */}
        <Card className="p-6">
          <h3 className="mb-4 font-medium text-gray-900 dark:text-white">직접 나레이션 입력</h3>
          <textarea
            placeholder="나레이션 텍스트를 직접 입력하세요..."
            className="h-32 w-full rounded-lg border border-gray-300 p-4 dark:border-gray-700 dark:bg-gray-800"
          />
          <div className="mt-4 flex justify-end">
            <button className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
              <Mic className="h-5 w-5" />
              나레이션 생성
            </button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
