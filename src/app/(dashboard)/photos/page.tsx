'use client';

import React from 'react';
import { MainLayout } from '@/components/layout';
import { Card } from '@/components/common';
import { Image, Upload, FolderPlus, Grid, List, Search } from 'lucide-react';

const photoFolders = [
  { id: '1', name: '가족 사진', count: 45, thumbnail: null },
  { id: '2', name: '여행 사진', count: 128, thumbnail: null },
  { id: '3', name: '졸업식', count: 32, thumbnail: null },
];

export default function PhotosPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">사진 관리</h1>
            <p className="text-gray-600 dark:text-gray-400">프로젝트에 사용할 사진을 관리하세요</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              <FolderPlus className="h-5 w-5" />
              새 폴더
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
              <Upload className="h-5 w-5" />
              업로드
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="사진 검색..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-700">
            <button className="rounded-l-lg bg-gray-100 p-2 dark:bg-gray-800">
              <Grid className="h-5 w-5" />
            </button>
            <button className="rounded-r-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800">
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photoFolders.map((folder) => (
            <Card key={folder.id} hoverable className="p-4">
              <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <Image className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">{folder.name}</h3>
              <p className="text-sm text-gray-500">{folder.count}장</p>
            </Card>
          ))}

          {/* Upload Placeholder */}
          <Card className="flex h-full cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gray-300 p-8 hover:border-purple-500 dark:border-gray-700">
            <Upload className="h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">사진 업로드</p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
