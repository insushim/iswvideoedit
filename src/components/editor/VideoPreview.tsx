'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Maximize2,
  Minimize2,
  Settings,
  Monitor,
  Smartphone,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface VideoPreviewProps {
  compositionId: string;
  inputProps: any;
  durationInFrames: number;
  fps: number;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  currentFrame: number;
  isPlaying: boolean;
  onFrameChange: (frame: number) => void;
  onPlayChange: (isPlaying: boolean) => void;
}

const aspectRatioConfig = {
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
  '4:3': { width: 1440, height: 1080 },
};

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  compositionId,
  inputProps,
  durationInFrames,
  fps,
  aspectRatio,
  currentFrame,
  isPlaying,
  onFrameChange,
  onPlayChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const narrationRef = useRef<HTMLAudioElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewSize, setPreviewSize] = useState<'fit' | 'fill'>('fit');
  const [isMuted, setIsMuted] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 640, height: 360 });

  const { width, height } = aspectRatioConfig[aspectRatio];

  // Calculate timing
  const introFrames = fps * 3;
  const photoDuration = fps * 4;
  const photos = inputProps?.project?.photos || [];
  const totalPhotoFrames = photos.length * photoDuration;
  const outroStart = introFrames + totalPhotoFrames;
  const outroFrames = fps * 3;

  // Audio URLs from project
  const bgmUrl = inputProps?.project?.audio?.bgmUrl || inputProps?.project?.audio?.url;
  const narrationUrl = inputProps?.project?.narration?.audioUrl;

  // Handle container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight - 48,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Sync audio with playback
  useEffect(() => {
    const currentTime = currentFrame / fps;

    if (audioRef.current) {
      if (Math.abs(audioRef.current.currentTime - currentTime) > 0.5) {
        audioRef.current.currentTime = currentTime;
      }
      audioRef.current.muted = isMuted;
      if (isPlaying && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      } else if (!isPlaying && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    }

    if (narrationRef.current) {
      if (Math.abs(narrationRef.current.currentTime - currentTime) > 0.5) {
        narrationRef.current.currentTime = currentTime;
      }
      narrationRef.current.muted = isMuted;
      if (isPlaying && narrationRef.current.paused) {
        narrationRef.current.play().catch(() => {});
      } else if (!isPlaying && !narrationRef.current.paused) {
        narrationRef.current.pause();
      }
    }
  }, [currentFrame, fps, isPlaying, isMuted]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Calculate preview dimensions
  const previewDimensions = useMemo(() => {
    const videoAspect = width / height;
    const containerAspect = containerSize.width / containerSize.height;

    if (previewSize === 'fit') {
      if (containerAspect > videoAspect) {
        return {
          width: Math.floor(containerSize.height * videoAspect),
          height: containerSize.height,
        };
      } else {
        return {
          width: containerSize.width,
          height: Math.floor(containerSize.width / videoAspect),
        };
      }
    }

    return { width: containerSize.width, height: containerSize.height };
  }, [containerSize, width, height, previewSize]);

  // Render intro section
  const renderIntro = () => {
    const progress = currentFrame / introFrames;
    const fadeIn = Math.min(1, progress * 2);
    const scale = 0.85 + progress * 0.15;
    const titleY = 50 - progress * 20;

    return (
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      >
        {/* Animated gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${30 + progress * 40}% ${30 + progress * 40}%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`,
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => {
            const x = (i * 47 + progress * 200) % 100;
            const y = (i * 31 + progress * 100) % 100;
            const size = 2 + (i % 3);
            const opacity = 0.2 + Math.sin(progress * Math.PI * 2 + i) * 0.2;
            return (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: size,
                  height: size,
                  opacity,
                }}
              />
            );
          })}
        </div>

        {/* Main content */}
        <div
          className="text-center z-10 px-8"
          style={{
            opacity: fadeIn,
            transform: `scale(${scale}) translateY(${titleY}px)`,
          }}
        >
          {/* Project title */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            style={{
              textShadow: '0 4px 30px rgba(0,0,0,0.5), 0 0 60px rgba(139, 92, 246, 0.3)',
              letterSpacing: '0.02em',
            }}
          >
            {inputProps?.project?.name || '새 프로젝트'}
          </h1>

          {/* Animated underline */}
          <div className="flex justify-center mb-6">
            <div
              className="h-1 rounded-full"
              style={{
                width: `${Math.min(progress * 200, 120)}px`,
                background: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 50%, #8B5CF6 100%)',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
              }}
            />
          </div>

          {/* Subtitle with fade */}
          <p
            className="text-base sm:text-lg text-gray-300"
            style={{
              opacity: Math.max(0, (progress - 0.3) * 2),
            }}
          >
            PhotoStory Pro
          </p>

          {/* Photo count */}
          {photos.length > 0 && (
            <p
              className="text-sm text-gray-400 mt-4"
              style={{
                opacity: Math.max(0, (progress - 0.5) * 2),
              }}
            >
              {photos.length}장의 사진으로 만든 이야기
            </p>
          )}
        </div>
      </div>
    );
  };

  // Render photo section
  const renderPhoto = () => {
    const frameInPhotoSection = currentFrame - introFrames;
    const photoIndex = Math.min(
      Math.floor(frameInPhotoSection / photoDuration),
      photos.length - 1
    );
    const photo = photos[photoIndex];
    const frameInPhoto = frameInPhotoSection % photoDuration;
    const photoProgress = frameInPhoto / photoDuration;

    // Smooth fade transitions
    const fadeInDuration = fps * 0.5;
    const fadeOutStart = photoDuration - fps * 0.5;
    let opacity = 1;
    if (frameInPhoto < fadeInDuration) {
      opacity = frameInPhoto / fadeInDuration;
    } else if (frameInPhoto > fadeOutStart) {
      opacity = (photoDuration - frameInPhoto) / (fps * 0.5);
    }

    // Subtle Ken Burns effect (very gentle)
    const scale = 1 + photoProgress * 0.02;
    const translateX = photoProgress * 1;
    const translateY = photoProgress * 0.5;

    const photoUrl = photo?.originalUrl || photo?.thumbnailUrl || photo?.url;

    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
        {/* Photo container */}
        <div
          className="relative flex items-center justify-center"
          style={{
            width: '100%',
            height: '100%',
            opacity,
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`Photo ${photoIndex + 1}`}
              className="max-w-[92%] max-h-[92%] object-contain rounded-sm"
              style={{
                transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-64 h-64 bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">이미지 로딩 중...</span>
            </div>
          )}
        </div>

        {/* Photo counter badge */}
        <div className="absolute bottom-5 right-5 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <span className="text-white text-sm font-medium">
            {photoIndex + 1} / {photos.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full transition-all duration-100"
            style={{
              width: `${photoProgress * 100}%`,
              background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
            }}
          />
        </div>
      </div>
    );
  };

  // Render outro section
  const renderOutro = () => {
    const outroProgress = Math.min((currentFrame - outroStart) / outroFrames, 1);
    const fadeIn = Math.min(1, outroProgress * 2);
    const scale = 0.9 + fadeIn * 0.1;

    return (
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f3460 0%, #16213e 50%, #1a1a2e 100%)',
        }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
          }}
        />

        {/* Content */}
        <div
          className="text-center z-10"
          style={{
            opacity: fadeIn,
            transform: `scale(${scale})`,
          }}
        >
          {/* Sparkle icon */}
          <div
            className="text-5xl sm:text-6xl mb-6"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
            }}
          >
            ✨
          </div>

          {/* Thank you text */}
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4"
            style={{
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            감사합니다
          </h2>

          {/* Subtitle */}
          <p className="text-gray-400 text-sm sm:text-base">
            Made with PhotoStory Pro
          </p>

          {/* Decorative line */}
          <div
            className="w-16 h-0.5 mx-auto mt-6 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, #8B5CF6, #EC4899, transparent)',
              opacity: Math.max(0, (outroProgress - 0.3) * 2),
            }}
          />
        </div>
      </div>
    );
  };

  // Determine which section to render
  const renderContent = () => {
    if (!photos || photos.length === 0) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Monitor className="h-8 w-8 text-white" />
            </div>
            <p className="text-lg font-medium text-white">사진이 없습니다</p>
            <p className="mt-1 text-sm text-gray-400">
              사진을 업로드해주세요
            </p>
          </div>
        </div>
      );
    }

    if (currentFrame < introFrames) {
      return renderIntro();
    }

    if (currentFrame < outroStart) {
      return renderPhoto();
    }

    return renderOutro();
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col bg-black',
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
      )}
    >
      {/* Audio elements */}
      {bgmUrl && (
        <audio
          ref={audioRef}
          src={bgmUrl}
          loop
          preload="auto"
          style={{ display: 'none' }}
        />
      )}
      {narrationUrl && (
        <audio
          ref={narrationRef}
          src={narrationUrl}
          preload="auto"
          style={{ display: 'none' }}
        />
      )}

      {/* Preview Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">미리보기</span>
          <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-500">
            {width}×{height}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Volume Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="rounded p-1.5 hover:bg-gray-800"
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-gray-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {/* Aspect Ratio Indicator */}
          <div className="flex items-center gap-1 rounded bg-gray-800 px-2 py-1">
            {aspectRatio === '16:9' && <Monitor className="h-4 w-4 text-gray-400" />}
            {aspectRatio === '9:16' && <Smartphone className="h-4 w-4 text-gray-400" />}
            {aspectRatio === '1:1' && <Square className="h-4 w-4 text-gray-400" />}
            <span className="text-xs text-gray-400">{aspectRatio}</span>
          </div>

          {/* Preview Size Toggle */}
          <button
            onClick={() => setPreviewSize(previewSize === 'fit' ? 'fill' : 'fit')}
            className="rounded p-1.5 hover:bg-gray-800"
            title={previewSize === 'fit' ? '채우기' : '맞추기'}
          >
            <Settings className="h-4 w-4 text-gray-400" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="rounded p-1.5 hover:bg-gray-800"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 text-gray-400" />
            ) : (
              <Maximize2 className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Video Player Container */}
      <div className="flex flex-1 items-center justify-center overflow-hidden bg-black">
        <div
          className="relative rounded-lg overflow-hidden shadow-2xl"
          style={{
            width: previewDimensions.width,
            height: previewDimensions.height,
            backgroundColor: '#000',
          }}
        >
          {renderContent()}
        </div>
      </div>

      {/* Frame Info */}
      <div className="border-t border-gray-800 bg-gray-900 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{fps} FPS</span>
          <span>
            {Math.floor((currentFrame / fps) / 60)}:
            {String(Math.floor((currentFrame / fps) % 60)).padStart(2, '0')}
          </span>
          <span>
            총 {Math.round(durationInFrames / fps)}초
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;
