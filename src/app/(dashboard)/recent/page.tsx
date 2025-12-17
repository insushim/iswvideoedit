'use client';

import React from 'react';
import { MainLayout } from '@/components/layout';
import { Card } from '@/components/common';
import { Clock, Video, Play, Image } from 'lucide-react';

const recentItems = [
  { id: '1', name: '우리 가족 여행기', type: 'project', photoCount: 24, duration: '3:45', accessedAt: '2시간 전' },
  { id: '2', name: '졸업식 축하 영상', type: 'project', photoCount: 18, accessedAt: '1일 전' },
  { id: '3', name: '회사 창립기념일', type: 'project', photoCount: 32, accessedAt: '3일 전' },
];

export default function RecentPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">최근 작업</h1>
          <p className="text-gray-600 dark:text-gray-400">최근에 작업한 프로젝트들</p>
        </div>

        <div className="space-y-4">
          {recentItems.map((item) => (
            <Card key={item.id} hoverable className="flex items-center gap-4 p-4">
              <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <Video className="h-8 w-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Image className="h-4 w-4" />
                    {item.photoCount}장
                  </span>
                  {item.duration && (
                    <span className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      {item.duration}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {item.accessedAt}
                  </span>
                </div>
              </div>
              <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
                열기
              </button>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
