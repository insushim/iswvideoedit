'use client';

import React from 'react';
import { MainLayout } from '@/components/layout';
import { Card } from '@/components/common';
import { Settings, User, Bell, Shield, Globe, Palette, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">설정</h1>
          <p className="text-gray-600 dark:text-gray-400">계정 및 앱 설정을 관리하세요</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-2">
              <nav className="space-y-1">
                {[
                  { icon: <User className="h-5 w-5" />, label: '프로필', active: true },
                  { icon: <Bell className="h-5 w-5" />, label: '알림' },
                  { icon: <Shield className="h-5 w-5" />, label: '보안' },
                  { icon: <Globe className="h-5 w-5" />, label: '언어 및 지역' },
                  { icon: <Palette className="h-5 w-5" />, label: '테마' },
                ].map((item) => (
                  <button
                    key={item.label}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left ${
                      item.active
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">프로필 설정</h2>

              <div className="space-y-6">
                {/* Profile Photo */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    프로필 사진
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-2xl font-bold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                      U
                    </div>
                    <button className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                      변경
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    이름
                  </label>
                  <input
                    type="text"
                    defaultValue="사용자"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    이메일
                  </label>
                  <input
                    type="email"
                    defaultValue="user@example.com"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
                    <Save className="h-5 w-5" />
                    저장
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
