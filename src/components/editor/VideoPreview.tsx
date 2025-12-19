'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Player, PlayerRef } from '@remotion/player';
import {
  Maximize2,
  Minimize2,
  Settings,
  Monitor,
  Smartphone,
  Square,
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
  const playerRef = useRef<PlayerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewSize, setPreviewSize] = useState<'fit' | 'fill'>('fit');

  const { width, height } = aspectRatioConfig[aspectRatio];

  // Sync player with external frame control
  useEffect(() => {
    if (playerRef.current) {
      const player = playerRef.current;
      const playerFrame = player.getCurrentFrame();

      if (Math.abs(playerFrame - currentFrame) > 1) {
        player.seekTo(currentFrame);
      }
    }
  }, [currentFrame]);

  // Handle play state sync
  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
    }
  }, [isPlaying]);

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
  const calculatePreviewDimensions = () => {
    if (!containerRef.current) return { width: 640, height: 360 };

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight - 48; // Subtract toolbar height

    const videoAspect = width / height;
    const containerAspect = containerWidth / containerHeight;

    if (previewSize === 'fit') {
      if (containerAspect > videoAspect) {
        // Container is wider than video
        return {
          width: Math.floor(containerHeight * videoAspect),
          height: containerHeight,
        };
      } else {
        // Container is taller than video
        return {
          width: containerWidth,
          height: Math.floor(containerWidth / videoAspect),
        };
      }
    }

    return { width: containerWidth, height: containerHeight };
  };

  const previewDimensions = calculatePreviewDimensions();

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col bg-black',
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
      )}
    >
      {/* Preview Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">미리보기</span>
          <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-500">
            {width}×{height}
          </span>
        </div>

        <div className="flex items-center gap-2">
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
        {/* Placeholder for Remotion Player */}
        <div
          className="relative rounded-lg bg-gray-800 shadow-2xl"
          style={{
            width: previewDimensions.width,
            height: previewDimensions.height,
          }}
        >
          {/* When Remotion is properly set up, use the Player component */}
          {/* <Player
            ref={playerRef}
            component={PhotoStory}
            compositionWidth={width}
            compositionHeight={height}
            durationInFrames={durationInFrames}
            fps={fps}
            inputProps={inputProps}
            style={{
              width: '100%',
              height: '100%',
            }}
            onFrameUpdate={onFrameChange}
            onPlayPause={(e) => onPlayChange(e.target.playing)}
          /> */}

          {/* Photo Slideshow Preview */}
          <div className="relative h-full w-full overflow-hidden">
            {inputProps?.project?.photos && inputProps.project.photos.length > 0 ? (
              <>
                {/* Calculate which photo to show based on current frame */}
                {(() => {
                  const clips = inputProps.clips || [];
                  const introFrames = fps * 3;
                  const photoDuration = fps * 4;
                  const transitionDuration = fps * 1;

                  // Intro
                  if (currentFrame < introFrames) {
                    return (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
                        <div className="text-center">
                          <h2 className="text-3xl font-bold text-white mb-2">
                            {inputProps.project.name || '새 프로젝트'}
                          </h2>
                          <p className="text-gray-300">PhotoStory Pro</p>
                        </div>
                      </div>
                    );
                  }

                  // Calculate photo index
                  const photoStartFrame = introFrames;
                  const frameInPhotoSection = currentFrame - photoStartFrame;
                  const photoIndex = Math.floor(frameInPhotoSection / (photoDuration - transitionDuration));
                  const photos = inputProps.project.photos;

                  // Outro
                  if (photoIndex >= photos.length) {
                    return (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-white mb-2">감사합니다</h2>
                          <p className="text-gray-300">PhotoStory Pro</p>
                        </div>
                      </div>
                    );
                  }

                  // Photo
                  const photo = photos[photoIndex];
                  const frameInPhoto = frameInPhotoSection % (photoDuration - transitionDuration);
                  const progress = frameInPhoto / photoDuration;

                  // Ken Burns effect
                  const scale = 1 + progress * 0.1;
                  const translateX = (photoIndex % 2 === 0 ? -1 : 1) * progress * 3;
                  const translateY = (photoIndex % 3 === 0 ? -1 : 1) * progress * 2;

                  // Fade transition
                  const fadeIn = Math.min(1, frameInPhoto / (fps * 0.5));
                  const fadeOut = frameInPhoto > photoDuration - fps * 0.5
                    ? 1 - (frameInPhoto - (photoDuration - fps * 0.5)) / (fps * 0.5)
                    : 1;
                  const opacity = Math.min(fadeIn, fadeOut);

                  return (
                    <div
                      className="h-full w-full"
                      style={{ opacity }}
                    >
                      <img
                        src={photo.thumbnailUrl || photo.originalUrl || photo.url}
                        alt={`Photo ${photoIndex + 1}`}
                        className="h-full w-full object-cover transition-transform duration-100"
                        style={{
                          transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
                        }}
                      />
                      {/* Photo number overlay */}
                      <div className="absolute bottom-4 right-4 bg-black/50 px-3 py-1 rounded-full">
                        <span className="text-white text-sm">
                          {photoIndex + 1} / {photos.length}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
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
            )}
          </div>

          {/* Aspect Ratio Overlay */}
          {aspectRatio === '9:16' && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-xs text-gray-600">모바일 세로 영상</div>
            </div>
          )}
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
