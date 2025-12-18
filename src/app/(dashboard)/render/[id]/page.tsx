'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Button, Card, ProgressBar } from '@/components/common';
import {
  CheckCircle,
  XCircle,
  Download,
  Share2,
  RotateCcw,
  Home,
  Edit3,
  Clock,
  Film,
  Loader2,
  Play,
} from 'lucide-react';

interface RenderJob {
  id: string;
  projectId: string;
  projectName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputUrl?: string;
  error?: string;
  settings: {
    resolution: string;
    format: string;
    quality: string;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export default function RenderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<RenderJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobStatus();
    const interval = setInterval(fetchJobStatus, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [jobId]);

  const fetchJobStatus = async () => {
    try {
      const response = await fetch(`/api/render/${jobId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setJob(data);

        // Stop polling if job is complete or failed
        if (data.status === 'completed' || data.status === 'failed') {
          // Keep state updated but no need to poll anymore
        }
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch job status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!job) return;

    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectId: job.projectId,
          settings: job.settings,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/render/${data.jobId}`);
      }
    } catch (error) {
      console.error('Failed to retry render:', error);
    }
  };

  const handleCancel = async () => {
    if (!job) return;

    try {
      await fetch(`/api/render/${jobId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      router.push(`/editor/${job.projectId}`);
    } catch (error) {
      console.error('Failed to cancel render:', error);
    }
  };

  const formatDuration = (start?: string, end?: string) => {
    if (!start) return '-';
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);

    if (duration < 60) return `${duration}초`;
    if (duration < 3600) return `${Math.floor(duration / 60)}분 ${duration % 60}초`;
    return `${Math.floor(duration / 3600)}시간 ${Math.floor((duration % 3600) / 60)}분`;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-purple-500" />
            <p className="mt-4 text-gray-500">로딩 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <p className="mt-4 text-gray-900 dark:text-white">렌더링 작업을 찾을 수 없습니다</p>
            <Link href="/dashboard">
              <Button variant="primary" className="mt-4">
                대시보드로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl p-6">
        <Card className="overflow-hidden">
          {/* Status Header */}
          <div className="border-b border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800">
            {job.status === 'pending' && (
              <>
                <Clock className="mx-auto h-16 w-16 text-yellow-500" />
                <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                  대기 중
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  렌더링 대기열에서 처리를 기다리고 있습니다
                </p>
              </>
            )}

            {job.status === 'processing' && (
              <>
                <div className="relative mx-auto h-24 w-24">
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="h-10 w-10 text-purple-600" />
                  </div>
                </div>
                <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                  영상 렌더링 중
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  고품질 영상을 만들고 있습니다. 잠시만 기다려주세요.
                </p>
              </>
            )}

            {job.status === 'completed' && (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                  렌더링 완료!
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  영상이 성공적으로 생성되었습니다
                </p>
              </>
            )}

            {job.status === 'failed' && (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <XCircle className="h-12 w-12 text-red-500" />
                </div>
                <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                  렌더링 실패
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  문제가 발생했습니다. 다시 시도해주세요.
                </p>
                {job.error && (
                  <p className="mt-2 text-sm text-red-500">{job.error}</p>
                )}
              </>
            )}
          </div>

          {/* Progress */}
          {(job.status === 'pending' || job.status === 'processing') && (
            <div className="p-6">
              <ProgressBar value={job.progress} size="lg" showValue />
              <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {job.status === 'pending' ? '대기 중...' : '렌더링 중...'}
                </span>
                <span>{job.progress}%</span>
              </div>
            </div>
          )}

          {/* Video Preview (when completed) */}
          {job.status === 'completed' && job.outputUrl && (
            <div className="p-6">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                <video
                  src={job.outputUrl}
                  controls
                  className="h-full w-full"
                  poster="/api/placeholder/640/360"
                />
              </div>
            </div>
          )}

          {/* Details */}
          <div className="border-t border-gray-200 p-6 dark:border-gray-700">
            <h2 className="mb-4 font-medium text-gray-900 dark:text-white">
              상세 정보
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">프로젝트</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {job.projectName}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">해상도</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {job.settings.resolution}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">포맷</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {job.settings.format.toUpperCase()}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">품질</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {job.settings.quality === 'high' && '고품질'}
                  {job.settings.quality === 'standard' && '표준'}
                  {job.settings.quality === 'draft' && '초안'}
                </p>
              </div>
              {job.startedAt && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">소요 시간</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDuration(job.startedAt, job.completedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-6 dark:border-gray-700">
            <div className="flex flex-wrap gap-3">
              {job.status === 'completed' && job.outputUrl && (
                <>
                  <a href={job.outputUrl} download>
                    <Button variant="primary" leftIcon={<Download className="h-4 w-4" />}>
                      다운로드
                    </Button>
                  </a>
                  <Button variant="secondary" leftIcon={<Share2 className="h-4 w-4" />}>
                    공유
                  </Button>
                </>
              )}

              {job.status === 'failed' && (
                <Button
                  variant="primary"
                  leftIcon={<RotateCcw className="h-4 w-4" />}
                  onClick={handleRetry}
                >
                  다시 시도
                </Button>
              )}

              {(job.status === 'pending' || job.status === 'processing') && (
                <Button
                  variant="secondary"
                  className="text-red-600"
                  onClick={handleCancel}
                >
                  취소
                </Button>
              )}

              <Link href={`/editor/${job.projectId}`}>
                <Button variant="ghost" leftIcon={<Edit3 className="h-4 w-4" />}>
                  편집기로 돌아가기
                </Button>
              </Link>

              <Link href="/dashboard">
                <Button variant="ghost" leftIcon={<Home className="h-4 w-4" />}>
                  대시보드
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
