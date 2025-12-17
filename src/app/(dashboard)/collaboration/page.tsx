'use client';

import React from 'react';
import { MainLayout } from '@/components/layout';
import { Card } from '@/components/common';
import { Users, Crown, UserPlus, Link as LinkIcon, Mail } from 'lucide-react';

const teamMembers = [
  { id: '1', name: '김철수', email: 'user1@example.com', role: 'owner', avatar: null },
  { id: '2', name: '이영희', email: 'user2@example.com', role: 'editor', avatar: null },
];

export default function CollaborationPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">공동작업</h1>
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-xs font-bold text-white">
              <Crown className="h-3 w-3" />
              PRO
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">팀원들과 함께 프로젝트를 편집하세요</p>
        </div>

        {/* Invite Section */}
        <Card className="mb-8 p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">팀원 초대</h2>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="이메일 주소 입력..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
              <UserPlus className="h-5 w-5" />
              초대
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">또는 초대 링크 공유:</span>
            <button className="text-sm text-purple-600 hover:underline">링크 복사</button>
          </div>
        </Card>

        {/* Team Members */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">팀원 목록</h2>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  {member.name[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    member.role === 'owner'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {member.role === 'owner' ? '소유자' : '편집자'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
