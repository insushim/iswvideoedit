'use client';

import React from 'react';
import { MainLayout } from '@/components/layout';
import { Card } from '@/components/common';
import { Video, Plus, Search, Filter, MoreVertical, Play, Clock, Image } from 'lucide-react';
import Link from 'next/link';

const projects = [
  { id: '1', name: '우리 가족 여행기', photoCount: 24, duration: '3:45', updatedAt: '2시간 전', status: 'completed' },
  { id: '2', name: '졸업식 축하 영상', photoCount: 18, updatedAt: '1일 전', status: 'rendering', progress: 65 },
  { id: '3', name: '회사 창립기념일', photoCount: 32, updatedAt: '3일 전', status: 'draft' },
  { id: '4', name: '아기의 첫 돌', photoCount: 45, duration: '5:20', updatedAt: '1주일 전', status: 'completed' },
];

export default function ProjectsPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">내 프로젝트</h1>
            <p className="text-gray-600 dark:text-gray-400">총 {projects.length}개의 프로젝트</p>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            <Plus className="h-5 w-5" />
            새 프로젝트
          </Link>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="프로젝트 검색..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700">
            <Filter className="h-5 w-5" />
            필터
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <Card key={project.id} hoverable className="group overflow-hidden">
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-12 w-12 text-gray-400" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                  <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                    <Play className="h-5 w-5" />
                  </button>
                </div>
                {project.duration && (
                  <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                    {project.duration}
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{project.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <Image className="h-3 w-3" />
                      <span>{project.photoCount}장</span>
                      <span>·</span>
                      <Clock className="h-3 w-3" />
                      <span>{project.updatedAt}</span>
                    </div>
                  </div>
                  <button className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
