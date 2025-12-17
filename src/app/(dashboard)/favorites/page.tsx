'use client';

import React from 'react';
import { MainLayout } from '@/components/layout';
import { Card } from '@/components/common';
import { Star, Video, Play, Image, Clock } from 'lucide-react';

const favorites = [
  { id: '1', name: '우리 가족 여행기', photoCount: 24, duration: '3:45', updatedAt: '2시간 전' },
  { id: '4', name: '아기의 첫 돌', photoCount: 45, duration: '5:20', updatedAt: '1주일 전' },
];

export default function FavoritesPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">즐겨찾기</h1>
          <p className="text-gray-600 dark:text-gray-400">즐겨찾기한 프로젝트들</p>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Star className="h-16 w-16 text-gray-300 dark:text-gray-700" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              즐겨찾기한 프로젝트가 없습니다
            </h3>
            <p className="mt-2 text-gray-500">프로젝트를 즐겨찾기에 추가해 보세요</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((project) => (
              <Card key={project.id} hoverable className="group overflow-hidden">
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                  <button className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </button>
                  {project.duration && (
                    <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                      {project.duration}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">{project.name}</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <Image className="h-3 w-3" />
                    <span>{project.photoCount}장</span>
                    <span>·</span>
                    <Clock className="h-3 w-3" />
                    <span>{project.updatedAt}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
