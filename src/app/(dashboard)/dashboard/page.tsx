'use client';

import React from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Button, Card } from '@/components/common';
import {
  Plus,
  FolderVideo,
  Clock,
  Star,
  TrendingUp,
  Play,
  MoreVertical,
  Image,
  Film,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

// Mock data for demonstration
const recentProjects = [
  {
    id: '1',
    name: '우리 가족 여행기',
    thumbnail: '/api/placeholder/320/180',
    updatedAt: '2시간 전',
    status: 'completed',
    duration: '3:45',
    photoCount: 24,
  },
  {
    id: '2',
    name: '졸업식 축하 영상',
    thumbnail: '/api/placeholder/320/180',
    updatedAt: '1일 전',
    status: 'rendering',
    progress: 65,
    photoCount: 18,
  },
  {
    id: '3',
    name: '회사 창립기념일',
    thumbnail: '/api/placeholder/320/180',
    updatedAt: '3일 전',
    status: 'draft',
    photoCount: 32,
  },
  {
    id: '4',
    name: '아기의 첫 돌',
    thumbnail: '/api/placeholder/320/180',
    updatedAt: '1주일 전',
    status: 'completed',
    duration: '5:20',
    photoCount: 45,
  },
];

const templates = [
  {
    id: '1',
    name: '졸업식',
    category: 'education',
    thumbnail: '/api/placeholder/200/120',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: '2',
    name: '결혼식',
    category: 'family',
    thumbnail: '/api/placeholder/200/120',
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: '3',
    name: '생일파티',
    category: 'family',
    thumbnail: '/api/placeholder/200/120',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: '4',
    name: '회사소개',
    category: 'business',
    thumbnail: '/api/placeholder/200/120',
    color: 'from-gray-600 to-gray-800',
  },
  {
    id: '5',
    name: '여행기록',
    category: 'events',
    thumbnail: '/api/placeholder/200/120',
    color: 'from-teal-500 to-emerald-600',
  },
  {
    id: '6',
    name: '콘서트',
    category: 'events',
    thumbnail: '/api/placeholder/200/120',
    color: 'from-purple-500 to-violet-600',
  },
];

const quickStats = [
  {
    label: '전체 프로젝트',
    value: '12',
    icon: <FolderVideo className="h-5 w-5" />,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    label: '이번 달 제작',
    value: '4',
    icon: <Film className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    label: '총 사진',
    value: '248',
    icon: <Image className="h-5 w-5" />,
    color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    label: '총 재생시간',
    value: '42분',
    icon: <Clock className="h-5 w-5" />,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  },
];

const getStatusBadge = (status: string, progress?: number) => {
  switch (status) {
    case 'completed':
      return (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          완료됨
        </span>
      );
    case 'rendering':
      return (
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          렌더링 {progress}%
        </span>
      );
    case 'draft':
      return (
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-400">
          초안
        </span>
      );
    default:
      return null;
  }
};

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            안녕하세요! 👋
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            오늘도 멋진 추억을 영상으로 만들어 보세요.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {quickStats.map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 p-6 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">새 프로젝트 시작하기</h2>
              <p className="mt-1 text-white/80">
                사진을 업로드하고 AI가 자동으로 감동적인 영상을 만들어 드립니다
              </p>
            </div>
            <Link href="/create">
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<Plus className="h-5 w-5" />}
                className="bg-white text-purple-600 hover:bg-white/90"
              >
                새 프로젝트
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              최근 프로젝트
            </h2>
            <Link
              href="/projects"
              className="flex items-center gap-1 text-sm text-purple-600 hover:underline dark:text-purple-400"
            >
              전체 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentProjects.map((project) => (
              <Card key={project.id} isHoverable className="group overflow-hidden">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
                    <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition-transform hover:scale-110">
                      <Play className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Duration Badge */}
                  {project.duration && (
                    <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                      {project.duration}
                    </div>
                  )}

                  {/* Rendering Progress */}
                  {project.status === 'rendering' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Image className="h-3 w-3" />
                        <span>{project.photoCount}장</span>
                        <span>·</span>
                        <Clock className="h-3 w-3" />
                        <span>{project.updatedAt}</span>
                      </div>
                    </div>
                    <button className="flex-shrink-0 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                  <div className="mt-2">
                    {getStatusBadge(project.status, project.progress)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Templates */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              인기 템플릿
            </h2>
            <Link
              href="/themes"
              className="flex items-center gap-1 text-sm text-purple-600 hover:underline dark:text-purple-400"
            >
              전체 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {templates.map((template) => (
              <Link key={template.id} href={`/create?template=${template.id}`}>
                <Card isHoverable className="group overflow-hidden">
                  <div
                    className={`aspect-[5/3] bg-gradient-to-br ${template.color} flex items-center justify-center`}
                  >
                    <Sparkles className="h-8 w-8 text-white/80 transition-transform group-hover:scale-110" />
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 rounded-2xl bg-gray-50 p-6 dark:bg-gray-800/50">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            💡 프로 팁
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  고화질 사진 사용
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  최소 1080p 이상의 사진을 사용하면 영상 품질이 더욱 좋아집니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  사진 순서 정렬
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  시간순으로 사진을 정렬하면 AI가 더 자연스러운 스토리를 만듭니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  다양한 구도
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  클로즈업, 전체샷 등 다양한 구도의 사진을 섞어 사용해보세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
