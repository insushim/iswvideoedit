'use client';

import React from 'react';
import { MainLayout } from '@/components/layout';
import { Card } from '@/components/common';
import { HelpCircle, Book, MessageCircle, Mail, ChevronRight, Search } from 'lucide-react';

const faqItems = [
  {
    question: '어떤 사진 형식을 지원하나요?',
    answer: 'JPG, PNG, WEBP 등 대부분의 이미지 형식을 지원합니다. 최적의 품질을 위해 1080p 이상의 해상도를 권장합니다.',
  },
  {
    question: '영상 렌더링에 얼마나 걸리나요?',
    answer: '사진 개수와 영상 길이에 따라 다르지만, 일반적으로 3-5분 정도 소요됩니다.',
  },
  {
    question: 'AI 나레이션은 어떻게 작동하나요?',
    answer: 'AI가 사진을 분석하여 자동으로 스토리를 작성하고, 선택한 목소리로 나레이션을 생성합니다.',
  },
  {
    question: '만든 영상을 다운로드할 수 있나요?',
    answer: '네, 완성된 영상은 MP4 형식으로 다운로드할 수 있습니다. PRO 플랜에서는 4K 해상도도 지원합니다.',
  },
];

const resources = [
  { icon: <Book className="h-6 w-6" />, title: '사용 가이드', description: '기본 사용법을 알아보세요' },
  { icon: <MessageCircle className="h-6 w-6" />, title: '커뮤니티', description: '다른 사용자들과 소통하세요' },
  { icon: <Mail className="h-6 w-6" />, title: '문의하기', description: '직접 문의를 남겨주세요' },
];

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">도움말</h1>
          <p className="text-gray-600 dark:text-gray-400">PhotoStory Pro 사용에 도움이 필요하신가요?</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="무엇이 궁금하신가요?"
            className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-lg dark:border-gray-700 dark:bg-gray-800"
          />
        </div>

        {/* Resources */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.title} hoverable className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                {resource.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">{resource.title}</h3>
                <p className="text-sm text-gray-500">{resource.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <Card className="p-6">
          <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">자주 묻는 질문</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details key={index} className="group">
                <summary className="flex cursor-pointer items-center justify-between rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <span className="font-medium text-gray-900 dark:text-white">{item.question}</span>
                  <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">{item.answer}</div>
              </details>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
