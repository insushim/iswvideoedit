'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/common';
import {
  Download,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Film,
  Image,
} from 'lucide-react';

interface Photo {
  id: string;
  thumbnailUrl?: string;
  originalUrl?: string;
  url?: string;
}

interface Project {
  id: string;
  name: string;
  photos: Photo[];
  settings?: {
    aspectRatio?: string;
  };
}

interface VideoExporterProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoExporter: React.FC<VideoExporterProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const [status, setStatus] = useState<'idle' | 'preparing' | 'recording' | 'processing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const fps = 30;
  const photoDuration = 4; // seconds per photo
  const transitionDuration = 0.5; // seconds for transition
  const introDuration = 3;
  const outroDuration = 3;

  const totalDuration = introDuration + (project.photos.length * photoDuration) + outroDuration;

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  };

  const drawFrame = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    currentTime: number,
    images: HTMLImageElement[]
  ) => {
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Intro
    if (currentTime < introDuration) {
      const progress = currentTime / introDuration;

      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#4F46E5');
      gradient.addColorStop(1, '#7C3AED');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Title with fade in
      const alpha = Math.min(1, progress * 2);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.floor(width / 15)}px Pretendard, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(project.name || '새 프로젝트', width / 2, height / 2 - 30);

      ctx.font = `${Math.floor(width / 30)}px Pretendard, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText('PhotoStory Pro', width / 2, height / 2 + 30);
      ctx.globalAlpha = 1;
      return;
    }

    // Photos section
    const photoStartTime = introDuration;
    const photoEndTime = introDuration + (project.photos.length * photoDuration);

    if (currentTime >= photoStartTime && currentTime < photoEndTime) {
      const timeInPhotoSection = currentTime - photoStartTime;
      const photoIndex = Math.floor(timeInPhotoSection / photoDuration);
      const timeInPhoto = timeInPhotoSection % photoDuration;

      if (photoIndex < images.length && images[photoIndex]) {
        const img = images[photoIndex];

        // Calculate Ken Burns effect (subtle zoom)
        const zoomProgress = timeInPhoto / photoDuration;
        const scale = 1 + zoomProgress * 0.05;

        // Fade in/out
        let alpha = 1;
        if (timeInPhoto < transitionDuration) {
          alpha = timeInPhoto / transitionDuration;
        } else if (timeInPhoto > photoDuration - transitionDuration) {
          alpha = (photoDuration - timeInPhoto) / transitionDuration;
        }

        ctx.globalAlpha = alpha;

        // Draw image with object-contain behavior
        const imgAspect = img.width / img.height;
        const canvasAspect = width / height;

        let drawWidth, drawHeight, drawX, drawY;

        if (imgAspect > canvasAspect) {
          drawWidth = width * scale;
          drawHeight = (width / imgAspect) * scale;
          drawX = (width - drawWidth) / 2;
          drawY = (height - drawHeight) / 2;
        } else {
          drawHeight = height * scale;
          drawWidth = (height * imgAspect) * scale;
          drawX = (width - drawWidth) / 2;
          drawY = (height - drawHeight) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // Photo counter
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        const counterWidth = 80;
        const counterHeight = 30;
        ctx.fillRect(width - counterWidth - 20, height - counterHeight - 20, counterWidth, counterHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${Math.floor(width / 50)}px Pretendard, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${photoIndex + 1} / ${images.length}`, width - counterWidth / 2 - 20, height - counterHeight / 2 - 20);

        ctx.globalAlpha = 1;
      }
      return;
    }

    // Outro
    if (currentTime >= photoEndTime) {
      const outroProgress = (currentTime - photoEndTime) / outroDuration;

      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#7C3AED');
      gradient.addColorStop(1, '#4F46E5');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Thank you message
      const alpha = outroProgress < 0.5 ? outroProgress * 2 : 1;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.floor(width / 15)}px Pretendard, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('감사합니다', width / 2, height / 2 - 30);

      ctx.font = `${Math.floor(width / 30)}px Pretendard, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText('PhotoStory Pro', width / 2, height / 2 + 30);
      ctx.globalAlpha = 1;
    }
  };

  const startExport = async () => {
    if (!canvasRef.current || project.photos.length === 0) {
      setErrorMessage('사진이 없습니다');
      setStatus('error');
      return;
    }

    setStatus('preparing');
    setProgress(0);
    setErrorMessage(null);
    chunksRef.current = [];

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setErrorMessage('Canvas를 초기화할 수 없습니다');
      setStatus('error');
      return;
    }

    // Set canvas size based on aspect ratio
    const aspectRatio = project.settings?.aspectRatio || '16:9';
    if (aspectRatio === '16:9') {
      canvas.width = 1280;
      canvas.height = 720;
    } else if (aspectRatio === '9:16') {
      canvas.width = 720;
      canvas.height = 1280;
    } else if (aspectRatio === '1:1') {
      canvas.width = 1080;
      canvas.height = 1080;
    } else {
      canvas.width = 1280;
      canvas.height = 960;
    }

    // Load all images
    try {
      setStatus('preparing');
      const images: HTMLImageElement[] = [];

      for (let i = 0; i < project.photos.length; i++) {
        const photo = project.photos[i];
        const src = photo.originalUrl || photo.thumbnailUrl || photo.url;
        if (src) {
          try {
            const img = await loadImage(src);
            images.push(img);
          } catch (e) {
            console.warn(`Failed to load image ${i}:`, e);
            // Create placeholder for failed images
            const placeholder = new window.Image();
            images.push(placeholder);
          }
        }
        setProgress(Math.floor((i + 1) / project.photos.length * 30));
      }

      // Start recording
      setStatus('recording');

      const stream = canvas.captureStream(fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000, // 5 Mbps for good quality
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        setStatus('processing');
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setStatus('done');
        setProgress(100);
      };

      mediaRecorder.start(100); // Collect data every 100ms

      // Render frames
      const totalFrames = Math.ceil(totalDuration * fps);
      let currentFrame = 0;

      const renderNextFrame = () => {
        if (currentFrame >= totalFrames) {
          mediaRecorder.stop();
          return;
        }

        const currentTime = currentFrame / fps;
        drawFrame(ctx, canvas, currentTime, images);

        currentFrame++;
        setProgress(30 + Math.floor((currentFrame / totalFrames) * 65));

        // Use requestAnimationFrame for smoother rendering
        // But limit to actual fps
        setTimeout(() => {
          requestAnimationFrame(renderNextFrame);
        }, 1000 / fps / 2); // Render faster than real-time
      };

      renderNextFrame();

    } catch (error) {
      console.error('Export error:', error);
      setErrorMessage('영상 생성 중 오류가 발생했습니다');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${project.name || 'photostory'}_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleClose = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setStatus('idle');
    setProgress(0);
    setDownloadUrl(null);
    setErrorMessage(null);
    onClose();
  };

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            영상 내보내기
          </h2>
          <button
            onClick={handleClose}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Canvas (hidden but needed for recording) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Content */}
        <div className="space-y-6">
          {/* Idle State */}
          {status === 'idle' && (
            <>
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <Film className="h-10 w-10 text-purple-500" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {project.name || '새 프로젝트'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {project.photos.length}장의 사진 · 약 {Math.ceil(totalDuration)}초
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                  내보내기 설정
                </h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>해상도</span>
                    <span className="text-gray-900 dark:text-white">HD (1280×720)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>포맷</span>
                    <span className="text-gray-900 dark:text-white">WebM (VP9)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>프레임율</span>
                    <span className="text-gray-900 dark:text-white">{fps} FPS</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={startExport}
                leftIcon={<Download className="h-4 w-4" />}
              >
                영상 생성 시작
              </Button>
            </>
          )}

          {/* Preparing/Recording/Processing State */}
          {(status === 'preparing' || status === 'recording' || status === 'processing') && (
            <div className="py-8 text-center">
              <div className="relative mx-auto h-20 w-20">
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <h3 className="mt-4 font-medium text-gray-900 dark:text-white">
                {status === 'preparing' && '이미지 로딩 중...'}
                {status === 'recording' && '영상 생성 중...'}
                {status === 'processing' && '영상 처리 중...'}
              </h3>

              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-purple-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {progress}%
                </p>
              </div>
            </div>
          )}

          {/* Done State */}
          {status === 'done' && (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>

              <h3 className="mt-4 font-medium text-gray-900 dark:text-white">
                영상 생성 완료!
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                다운로드 버튼을 클릭하여 저장하세요
              </p>

              <div className="mt-6 flex justify-center gap-3">
                <Button
                  variant="primary"
                  onClick={handleDownload}
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  다운로드
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStatus('idle');
                    setProgress(0);
                    if (downloadUrl) {
                      URL.revokeObjectURL(downloadUrl);
                      setDownloadUrl(null);
                    }
                  }}
                >
                  다시 만들기
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>

              <h3 className="mt-4 font-medium text-gray-900 dark:text-white">
                오류가 발생했습니다
              </h3>
              {errorMessage && (
                <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
              )}

              <Button
                variant="primary"
                className="mt-6"
                onClick={() => {
                  setStatus('idle');
                  setErrorMessage(null);
                }}
              >
                다시 시도
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoExporter;
