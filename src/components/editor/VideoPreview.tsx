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

          {/* Preview Placeholder */}
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <Monitor className="h-8 w-8 text-white" />
              </div>
              <p className="text-lg font-medium text-white">영상 미리보기</p>
              <p className="mt-1 text-sm text-gray-400">
                프레임: {currentFrame} / {durationInFrames}
              </p>
              <p className="text-sm text-gray-500">
                {Math.round(currentFrame / fps * 10) / 10}초
              </p>
            </div>
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
