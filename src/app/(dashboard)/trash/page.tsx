'use client';

import React from 'react';
import { MainLayout } from '@/components/layout';
import { Card } from '@/components/common';
import { Trash2, Video, RotateCcw, X, Image, Clock } from 'lucide-react';

const trashedItems = [
  { id: '5', name: '테스트 프로젝트', photoCount: 5, deletedAt: '3일 전' },
];

export default function TrashPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">휴지통</h1>
            <p className="text-gray-600 dark:text-gray-400">삭제된 프로젝트는 30일 후 영구 삭제됩니다</p>
          </div>
          {trashedItems.length > 0 && (
            <button className="text-sm text-red-600 hover:underline">휴지통 비우기</button>
          )}
        </div>

        {trashedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Trash2 className="h-16 w-16 text-gray-300 dark:text-gray-700" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              휴지통이 비어 있습니다
            </h3>
            <p className="mt-2 text-gray-500">삭제된 프로젝트가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trashedItems.map((item) => (
              <Card key={item.id} className="flex items-center gap-4 p-4">
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
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      삭제: {item.deletedAt}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                    <RotateCcw className="h-4 w-4" />
                    복원
                  </button>
                  <button className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20">
                    <X className="h-4 w-4" />
                    삭제
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
