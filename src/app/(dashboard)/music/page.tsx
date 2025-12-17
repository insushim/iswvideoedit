'use client';

import React from 'react';
import { MainLayout } from '@/components/layout';
import { Card } from '@/components/common';
import { Music, Play, Pause, Upload, Search, Crown } from 'lucide-react';

const musicTracks = [
  { id: '1', name: '감성 피아노', duration: '3:24', category: '감성', isPro: false },
  { id: '2', name: '밝은 어쿠스틱', duration: '2:58', category: '밝음', isPro: false },
  { id: '3', name: '시네마틱 오케스트라', duration: '4:12', category: '웅장', isPro: true },
  { id: '4', name: '따뜻한 기타', duration: '3:45', category: '감성', isPro: false },
  { id: '5', name: '경쾌한 팝', duration: '3:08', category: '밝음', isPro: false },
  { id: '6', name: '잔잔한 뉴에이지', duration: '4:30', category: '감성', isPro: false },
];

const categories = ['전체', '감성', '밝음', '웅장', '잔잔'];

export default function MusicPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">배경음악</h1>
            <p className="text-gray-600 dark:text-gray-400">영상에 어울리는 배경음악을 선택하세요</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
            <Upload className="h-5 w-5" />
            내 음악 업로드
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="음악 검색..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div className="flex flex-wrap gap-2">
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
        </div>

        <div className="space-y-3">
          {musicTracks.map((track) => (
            <Card key={track.id} className="flex items-center gap-4 p-4">
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">
                <Play className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{track.name}</h3>
                  {track.isPro && (
                    <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                      <Crown className="h-3 w-3" />
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {track.category} · {track.duration}
                </p>
              </div>
              <button className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
                선택
              </button>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
