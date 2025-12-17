'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { PhotoUploader, ThemeSelector } from '@/components/editor';
import { Button, Card, Input, ProgressBar } from '@/components/common';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Image,
  Palette,
  Settings,
  Sparkles,
  Wand2,
} from 'lucide-react';

type Step = 'photos' | 'theme' | 'settings' | 'generate';

interface ProjectSettings {
  name: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  resolution: '720p' | '1080p' | '4k';
  enableNarration: boolean;
  enableBackgroundMusic: boolean;
}

const steps = [
  { id: 'photos', label: '사진 업로드', icon: Image },
  { id: 'theme', label: '테마 선택', icon: Palette },
  { id: 'settings', label: '설정', icon: Settings },
  { id: 'generate', label: 'AI 생성', icon: Sparkles },
];

export default function CreateProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('photos');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('elegant-fade');
  const [settings, setSettings] = useState<ProjectSettings>({
    name: '',
    aspectRatio: '16:9',
    resolution: '1080p',
    enableNarration: true,
    enableBackgroundMusic: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const createProject = async () => {
    if (projectId) return projectId;

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settings.name || '새 프로젝트',
          themeId: selectedThemeId,
          settings: {
            aspectRatio: settings.aspectRatio,
            resolution: settings.resolution,
          },
        }),
      });

      if (response.ok) {
        const project = await response.json();
        setProjectId(project.id);
        return project.id;
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
    return null;
  };

  const handleNext = async () => {
    if (currentStep === 'photos') {
      const id = await createProject();
      if (id) {
        setCurrentStep('theme');
      }
    } else if (currentStep === 'theme') {
      setCurrentStep('settings');
    } else if (currentStep === 'settings') {
      setCurrentStep('generate');
      startGeneration();
    }
  };

  const handleBack = () => {
    if (currentStep === 'theme') {
      setCurrentStep('photos');
    } else if (currentStep === 'settings') {
      setCurrentStep('theme');
    } else if (currentStep === 'generate') {
      setCurrentStep('settings');
    }
  };

  const startGeneration = async () => {
    if (!projectId) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Step 1: Generate intro/outro
      setGenerationProgress(20);
      await fetch('/api/ai/intro-outro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      // Step 2: Generate narration
      setGenerationProgress(50);
      if (settings.enableNarration) {
        await fetch('/api/ai/narration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            style: 'emotional',
            language: 'ko',
          }),
        });
      }

      // Step 3: Update project settings
      setGenerationProgress(80);
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settings.name || '새 프로젝트',
          themeId: selectedThemeId,
          settings: {
            aspectRatio: settings.aspectRatio,
            resolution: settings.resolution,
            fps: 30,
          },
        }),
      });

      setGenerationProgress(100);

      // Navigate to editor
      setTimeout(() => {
        router.push(`/editor/${projectId}`);
      }, 1000);
    } catch (error) {
      console.error('Generation failed:', error);
      setIsGenerating(false);
    }
  };

  return (
    <MainLayout showMobileNav={false}>
      <div className="mx-auto max-w-5xl p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            새 프로젝트 만들기
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            사진을 업로드하고 테마를 선택하면 AI가 자동으로 영상을 만들어 드립니다
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                        isActive
                          ? 'bg-purple-600 text-white'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isActive
                          ? 'text-purple-600 dark:text-purple-400'
                          : isCompleted
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-4 ${
                        index < currentStepIndex
                          ? 'bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-6">
          {currentStep === 'photos' && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                사진 업로드
              </h2>
              <PhotoUploader
                projectId={projectId || 'temp'}
                onPhotosUploaded={(photos) => setPhotoCount(photos.length)}
                onProjectCreated={(id) => setProjectId(id)}
              />
            </div>
          )}

          {currentStep === 'theme' && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                테마 선택
              </h2>
              <ThemeSelector
                selectedThemeId={selectedThemeId}
                onSelect={setSelectedThemeId}
              />
            </div>
          )}

          {currentStep === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                프로젝트 설정
              </h2>

              <Input
                label="프로젝트 이름"
                placeholder="프로젝트 이름을 입력하세요"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    화면 비율
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['16:9', '9:16', '1:1', '4:3'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setSettings({ ...settings, aspectRatio: ratio })}
                        className={`rounded-lg border-2 p-3 text-center transition-all ${
                          settings.aspectRatio === ratio
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                        }`}
                      >
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                          {ratio}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {ratio === '16:9' && 'YouTube, TV'}
                          {ratio === '9:16' && '틱톡, 릴스'}
                          {ratio === '1:1' && '인스타그램'}
                          {ratio === '4:3' && '기본'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    해상도
                  </label>
                  <div className="space-y-2">
                    {(['720p', '1080p', '4k'] as const).map((res) => (
                      <button
                        key={res}
                        onClick={() => setSettings({ ...settings, resolution: res })}
                        className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                          settings.resolution === res
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                        }`}
                      >
                        <span className="font-medium text-gray-900 dark:text-white">{res}</span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {res === '720p' && '(HD)'}
                          {res === '1080p' && '(Full HD)'}
                          {res === '4k' && '(Ultra HD)'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.enableNarration}
                    onChange={(e) =>
                      setSettings({ ...settings, enableNarration: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      AI 나레이션 생성
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      사진을 분석하여 감동적인 나레이션을 자동 생성합니다
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.enableBackgroundMusic}
                    onChange={(e) =>
                      setSettings({ ...settings, enableBackgroundMusic: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      배경음악 자동 추가
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      테마에 맞는 배경음악을 자동으로 추가합니다
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {currentStep === 'generate' && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <Wand2 className="h-10 w-10 text-white" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isGenerating ? 'AI가 영상을 생성하고 있습니다' : '생성 완료!'}
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {isGenerating
                  ? '잠시만 기다려주세요. AI가 최적의 구성을 찾고 있습니다.'
                  : '에디터에서 영상을 확인하고 편집할 수 있습니다.'}
              </p>

              <div className="mx-auto mt-8 max-w-md">
                <ProgressBar value={generationProgress} size="lg" showValue />
              </div>

              {isGenerating && (
                <div className="mt-6 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  {generationProgress >= 20 && <p>✓ 인트로/아웃트로 생성 중...</p>}
                  {generationProgress >= 50 && <p>✓ 나레이션 생성 중...</p>}
                  {generationProgress >= 80 && <p>✓ 프로젝트 구성 중...</p>}
                  {generationProgress >= 100 && <p>✓ 완료!</p>}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        {currentStep !== 'generate' && (
          <div className="mt-6 flex justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 'photos'}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              이전
            </Button>

            <Button
              variant="primary"
              onClick={handleNext}
              disabled={
                (currentStep === 'photos' && photoCount === 0) ||
                (currentStep === 'theme' && !selectedThemeId)
              }
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {currentStep === 'settings' ? 'AI로 생성하기' : '다음'}
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
