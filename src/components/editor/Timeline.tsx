'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  GripVertical,
  Image,
  Music,
  Mic,
  Film,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/common';

interface TimelineClip {
  id: string;
  type: 'photo' | 'intro' | 'outro';
  startFrame: number;
  durationInFrames: number;
  thumbnailUrl?: string;
  transitionIn?: string;
  transitionOut?: string;
}

interface AudioClip {
  id: string;
  type: 'music' | 'narration';
  startFrame: number;
  durationInFrames: number;
  volume: number;
  url?: string;
  name?: string;
}

interface TimelineProps {
  clips: TimelineClip[];
  audioClips: AudioClip[];
  currentFrame: number;
  totalFrames: number;
  fps: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (frame: number) => void;
  onClipSelect: (clipId: string) => void;
  onClipMove: (clipId: string, newStartFrame: number) => void;
  onClipResize: (clipId: string, newDuration: number) => void;
  onClipDelete: (clipId: string) => void;
  selectedClipId?: string;
}

const formatTime = (frame: number, fps: number): string => {
  const totalSeconds = Math.floor(frame / fps);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const frames = frame % fps;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
};

export const Timeline: React.FC<TimelineProps> = ({
  clips,
  audioClips,
  currentFrame,
  totalFrames,
  fps,
  isPlaying,
  onPlay,
  onPause,
  onSeek,
  onClipSelect,
  onClipMove,
  onClipResize,
  onClipDelete,
  selectedClipId,
}) => {
  const [zoom, setZoom] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pixelsPerFrame = zoom * 2;
  const timelineWidth = totalFrames * pixelsPerFrame;

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
      const frame = Math.floor(x / pixelsPerFrame);
      onSeek(Math.max(0, Math.min(frame, totalFrames)));
    }
  };

  const handlePlayheadDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleTimelineClick(e);
  };

  // Auto-scroll to keep playhead visible
  useEffect(() => {
    if (timelineRef.current && isPlaying) {
      const playheadPosition = currentFrame * pixelsPerFrame;
      const scrollLeft = timelineRef.current.scrollLeft;
      const viewWidth = timelineRef.current.clientWidth;

      if (playheadPosition > scrollLeft + viewWidth - 100) {
        timelineRef.current.scrollLeft = playheadPosition - 100;
      }
    }
  }, [currentFrame, pixelsPerFrame, isPlaying]);

  // Generate time markers
  const markerInterval = fps * Math.ceil(5 / zoom); // Adjust interval based on zoom
  const markers = [];
  for (let frame = 0; frame <= totalFrames; frame += markerInterval) {
    markers.push(frame);
  }

  return (
    <div className="flex flex-col bg-gray-900">
      {/* Controls Bar */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSeek(0)}
            className="rounded p-1.5 hover:bg-gray-800"
          >
            <SkipBack className="h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="ml-0.5 h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onSeek(totalFrames)}
            className="rounded p-1.5 hover:bg-gray-800"
          >
            <SkipForward className="h-4 w-4 text-gray-400" />
          </button>

          <div className="ml-4 font-mono text-sm text-gray-400">
            {formatTime(currentFrame, fps)} / {formatTime(totalFrames, fps)}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="rounded p-1.5 hover:bg-gray-800"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-gray-400" />
              ) : (
                <Volume2 className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="rounded p-1.5 hover:bg-gray-800"
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4 text-gray-400" />
            </button>
            <span className="w-12 text-center text-xs text-gray-400">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
              className="rounded p-1.5 hover:bg-gray-800"
              disabled={zoom >= 4}
            >
              <ZoomIn className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Tracks */}
      <div
        ref={timelineRef}
        className="relative overflow-x-auto overflow-y-hidden"
        onClick={handleTimelineClick}
        onMouseMove={handlePlayheadDrag}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Time Ruler */}
        <div className="sticky top-0 z-20 flex h-6 bg-gray-800" style={{ width: timelineWidth }}>
          {markers.map((frame) => (
            <div
              key={frame}
              className="absolute border-l border-gray-700"
              style={{ left: frame * pixelsPerFrame }}
            >
              <span className="ml-1 text-[10px] text-gray-500">
                {formatTime(frame, fps)}
              </span>
            </div>
          ))}
        </div>

        {/* Video Track */}
        <div className="relative h-20 bg-gray-900" style={{ width: timelineWidth }}>
          <div className="absolute inset-y-0 left-0 flex w-24 items-center border-r border-gray-800 bg-gray-900 px-2">
            <Film className="mr-2 h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-400">영상</span>
          </div>
          <div className="ml-24 h-full" style={{ width: timelineWidth - 96 }}>
            {clips.map((clip) => (
              <div
                key={clip.id}
                className={cn(
                  'absolute top-2 h-16 cursor-pointer rounded-lg transition-all',
                  clip.type === 'intro' && 'bg-purple-600/80',
                  clip.type === 'outro' && 'bg-pink-600/80',
                  clip.type === 'photo' && 'bg-blue-600/80',
                  selectedClipId === clip.id && 'ring-2 ring-white'
                )}
                style={{
                  left: clip.startFrame * pixelsPerFrame,
                  width: clip.durationInFrames * pixelsPerFrame,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClipSelect(clip.id);
                }}
              >
                {/* Clip Content */}
                <div className="flex h-full items-center gap-2 px-2">
                  {clip.thumbnailUrl ? (
                    <img
                      src={clip.thumbnailUrl}
                      alt=""
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-black/30">
                      <Image className="h-5 w-5 text-white/50" />
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <span className="block truncate text-xs font-medium text-white">
                      {clip.type === 'intro' && '인트로'}
                      {clip.type === 'outro' && '아웃트로'}
                      {clip.type === 'photo' && '사진'}
                    </span>
                    <span className="text-[10px] text-white/70">
                      {Math.round(clip.durationInFrames / fps * 10) / 10}초
                    </span>
                  </div>
                </div>

                {/* Resize Handles */}
                <div className="absolute inset-y-0 left-0 w-1 cursor-ew-resize bg-white/20 opacity-0 hover:opacity-100" />
                <div className="absolute inset-y-0 right-0 w-1 cursor-ew-resize bg-white/20 opacity-0 hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Music Track */}
        <div className="relative h-12 border-t border-gray-800 bg-gray-900/80" style={{ width: timelineWidth }}>
          <div className="absolute inset-y-0 left-0 flex w-24 items-center border-r border-gray-800 bg-gray-900 px-2">
            <Music className="mr-2 h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-400">배경음악</span>
          </div>
          <div className="ml-24 h-full">
            {audioClips
              .filter((a) => a.type === 'music')
              .map((audio) => (
                <div
                  key={audio.id}
                  className="absolute top-1 h-10 rounded bg-green-600/80"
                  style={{
                    left: audio.startFrame * pixelsPerFrame,
                    width: audio.durationInFrames * pixelsPerFrame,
                  }}
                >
                  <div className="flex h-full items-center px-2">
                    <Music className="mr-1 h-3 w-3 text-white/70" />
                    <span className="truncate text-xs text-white">{audio.name || '배경음악'}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Narration Track */}
        <div className="relative h-12 border-t border-gray-800 bg-gray-900/80" style={{ width: timelineWidth }}>
          <div className="absolute inset-y-0 left-0 flex w-24 items-center border-r border-gray-800 bg-gray-900 px-2">
            <Mic className="mr-2 h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-400">나레이션</span>
          </div>
          <div className="ml-24 h-full">
            {audioClips
              .filter((a) => a.type === 'narration')
              .map((audio) => (
                <div
                  key={audio.id}
                  className="absolute top-1 h-10 rounded bg-orange-600/80"
                  style={{
                    left: audio.startFrame * pixelsPerFrame,
                    width: audio.durationInFrames * pixelsPerFrame,
                  }}
                >
                  <div className="flex h-full items-center px-2">
                    <Mic className="mr-1 h-3 w-3 text-white/70" />
                    <span className="truncate text-xs text-white">나레이션</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 z-30 w-0.5 bg-red-500"
          style={{ left: currentFrame * pixelsPerFrame + 96 }}
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="absolute -left-2 -top-1 h-3 w-5 cursor-pointer bg-red-500" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
        </div>
      </div>

      {/* Selected Clip Actions */}
      {selectedClipId && (
        <div className="flex items-center gap-2 border-t border-gray-800 bg-gray-900 px-4 py-2">
          <span className="text-xs text-gray-400">선택된 클립:</span>
          <Button variant="ghost" size="sm" className="text-gray-400">
            전환효과 변경
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400">
            시간 조절
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
            onClick={() => onClipDelete(selectedClipId)}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            삭제
          </Button>
        </div>
      )}
    </div>
  );
};

export default Timeline;
