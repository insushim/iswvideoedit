'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EditorLayout } from '@/components/layout';
import { Timeline, VideoPreview, VideoExporter } from '@/components/editor';
import { Button, Card } from '@/components/common';
import {
  Layers,
  Palette,
  Music,
  Mic,
  Type,
  Sparkles,
  Image,
  Settings,
  Download,
  Wand2,
} from 'lucide-react';

type PanelType = 'layers' | 'theme' | 'music' | 'narration' | 'text' | 'effects';

interface Project {
  id: string;
  name: string;
  themeId: string;
  settings: {
    aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
    fps: number;
    resolution: string;
  };
  photos: Array<{
    id: string;
    thumbnailUrl: string;
    order: number;
  }>;
  timeline: any[];
  audio: any;
  narration: any;
  introConfig: any;
  outroConfig: any;
}

const panels = [
  { id: 'layers', label: '레이어', icon: Layers },
  { id: 'theme', label: '테마', icon: Palette },
  { id: 'music', label: '음악', icon: Music },
  { id: 'narration', label: '나레이션', icon: Mic },
  { id: 'text', label: '텍스트', icon: Type },
  { id: 'effects', label: '효과', icon: Sparkles },
];

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [activePanel, setActivePanel] = useState<PanelType>('layers');
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | undefined>();
  const [showExporter, setShowExporter] = useState(false);

  // Calculate timeline data
  const fps = project?.settings?.fps || 30;
  const photoDuration = fps * 4; // 4 seconds per photo
  const transitionDuration = fps * 1; // 1 second transition

  const clips = project
    ? [
        // Intro
        {
          id: 'intro',
          type: 'intro' as const,
          startFrame: 0,
          durationInFrames: fps * 3,
        },
        // Photos
        ...project.photos.map((photo, index) => ({
          id: photo.id,
          type: 'photo' as const,
          startFrame: fps * 3 + index * (photoDuration - transitionDuration),
          durationInFrames: photoDuration,
          thumbnailUrl: photo.thumbnailUrl,
        })),
        // Outro
        {
          id: 'outro',
          type: 'outro' as const,
          startFrame:
            fps * 3 +
            project.photos.length * (photoDuration - transitionDuration),
          durationInFrames: fps * 3,
        },
      ]
    : [];

  const totalFrames = clips.length > 0
    ? clips[clips.length - 1].startFrame + clips[clips.length - 1].durationInFrames
    : fps * 30;

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Failed to fetch project:', error);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, router]);

  // Playback
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= totalFrames - 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [isPlaying, fps, totalFrames]);

  const handleSave = async () => {
    if (!project) return;

    setIsSaving(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          timeline: clips,
        }),
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    setShowExporter(true);
  };

  const handlePreview = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setCurrentFrame(0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="mt-4 text-gray-400">프로젝트 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-gray-400">프로젝트를 찾을 수 없습니다</p>
          <Button variant="primary" className="mt-4" onClick={() => router.push('/dashboard')}>
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <EditorLayout
      projectName={project.name}
      projectId={project.id}
      isSaving={isSaving}
      hasUnsavedChanges={hasUnsavedChanges}
      onSave={handleSave}
      onPreview={handlePreview}
      onExport={handleExport}
    >
      <div className="flex h-full">
        {/* Left Sidebar - Tool Panels */}
        <div className="flex w-64 flex-col border-r border-gray-800 bg-gray-900">
          {/* Panel Tabs */}
          <div className="grid grid-cols-3 gap-1 border-b border-gray-800 p-2">
            {panels.slice(0, 6).map((panel) => {
              const Icon = panel.icon;
              return (
                <button
                  key={panel.id}
                  onClick={() => setActivePanel(panel.id as PanelType)}
                  className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-colors ${
                    activePanel === panel.id
                      ? 'bg-purple-600/20 text-purple-400'
                      : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px]">{panel.label}</span>
                </button>
              );
            })}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activePanel === 'layers' && (
              <div className="space-y-2">
                <h3 className="mb-3 font-medium text-white">레이어</h3>
                {clips.map((clip, index) => (
                  <div
                    key={clip.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors ${
                      selectedClipId === clip.id
                        ? 'bg-purple-600/20 text-white'
                        : 'text-gray-400 hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedClipId(clip.id)}
                  >
                    {'thumbnailUrl' in clip && clip.thumbnailUrl ? (
                      <img
                        src={clip.thumbnailUrl}
                        alt=""
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-800">
                        {clip.type === 'intro' && <Wand2 className="h-4 w-4" />}
                        {clip.type === 'outro' && <Sparkles className="h-4 w-4" />}
                        {clip.type === 'photo' && <Image className="h-4 w-4" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm">
                        {clip.type === 'intro' && '인트로'}
                        {clip.type === 'outro' && '아웃트로'}
                        {clip.type === 'photo' && `사진 ${index}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(clip.durationInFrames / fps * 10) / 10}초
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activePanel === 'theme' && (
              <div>
                <h3 className="mb-3 font-medium text-white">테마</h3>
                <p className="text-sm text-gray-400">현재 테마: {project.themeId}</p>
                <Button variant="secondary" size="sm" className="mt-4 w-full">
                  테마 변경
                </Button>
              </div>
            )}

            {activePanel === 'music' && (
              <div>
                <h3 className="mb-3 font-medium text-white">배경음악</h3>
                <Button variant="secondary" size="sm" className="w-full" leftIcon={<Music className="h-4 w-4" />}>
                  음악 추가
                </Button>
              </div>
            )}

            {activePanel === 'narration' && (
              <div>
                <h3 className="mb-3 font-medium text-white">나레이션</h3>
                <Button variant="secondary" size="sm" className="w-full" leftIcon={<Wand2 className="h-4 w-4" />}>
                  AI 나레이션 생성
                </Button>
              </div>
            )}

            {activePanel === 'text' && (
              <div>
                <h3 className="mb-3 font-medium text-white">텍스트</h3>
                <Button variant="secondary" size="sm" className="w-full" leftIcon={<Type className="h-4 w-4" />}>
                  텍스트 추가
                </Button>
              </div>
            )}

            {activePanel === 'effects' && (
              <div>
                <h3 className="mb-3 font-medium text-white">효과</h3>
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    전환효과 변경
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    필터 적용
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Ken Burns 효과
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Video Preview */}
          <div className="flex-1 bg-gray-950">
            <VideoPreview
              compositionId="PhotoStory"
              inputProps={{
                project,
                clips,
              }}
              durationInFrames={totalFrames}
              fps={fps}
              aspectRatio={project.settings.aspectRatio}
              currentFrame={currentFrame}
              isPlaying={isPlaying}
              onFrameChange={setCurrentFrame}
              onPlayChange={setIsPlaying}
            />
          </div>

          {/* Timeline */}
          <div className="h-56 border-t border-gray-800">
            <Timeline
              clips={clips}
              audioClips={[]}
              currentFrame={currentFrame}
              totalFrames={totalFrames}
              fps={fps}
              isPlaying={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onSeek={setCurrentFrame}
              onClipSelect={setSelectedClipId}
              onClipMove={(id, newStart) => {
                setHasUnsavedChanges(true);
                // Handle clip move
              }}
              onClipResize={(id, newDuration) => {
                setHasUnsavedChanges(true);
                // Handle clip resize
              }}
              onClipDelete={(id) => {
                setHasUnsavedChanges(true);
                // Handle clip delete
              }}
              selectedClipId={selectedClipId}
            />
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-72 border-l border-gray-800 bg-gray-900 p-4">
          <h3 className="mb-4 font-medium text-white">속성</h3>

          {selectedClipId ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">시작 시간</label>
                <div className="text-sm text-white">
                  {(() => {
                    const clip = clips.find((c) => c.id === selectedClipId);
                    if (!clip) return '0:00';
                    const seconds = Math.floor(clip.startFrame / fps);
                    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
                  })()}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">지속 시간</label>
                <div className="text-sm text-white">
                  {(() => {
                    const clip = clips.find((c) => c.id === selectedClipId);
                    if (!clip) return '0초';
                    return `${Math.round(clip.durationInFrames / fps * 10) / 10}초`;
                  })()}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">전환효과 (들어오기)</label>
                <select className="w-full rounded bg-gray-800 px-3 py-2 text-sm text-white">
                  <option>페이드</option>
                  <option>슬라이드 왼쪽</option>
                  <option>슬라이드 오른쪽</option>
                  <option>줌 인</option>
                  <option>줌 아웃</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">전환효과 (나가기)</label>
                <select className="w-full rounded bg-gray-800 px-3 py-2 text-sm text-white">
                  <option>페이드</option>
                  <option>슬라이드 왼쪽</option>
                  <option>슬라이드 오른쪽</option>
                  <option>줌 인</option>
                  <option>줌 아웃</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <Settings className="mx-auto h-8 w-8 opacity-50" />
              <p className="mt-2 text-sm">클립을 선택하여 속성을 편집하세요</p>
            </div>
          )}
        </div>
      </div>

      {/* Video Exporter Modal */}
      {project && (
        <VideoExporter
          project={{
            id: project.id,
            name: project.name,
            photos: project.photos,
            settings: project.settings,
          }}
          isOpen={showExporter}
          onClose={() => setShowExporter(false)}
        />
      )}
    </EditorLayout>
  );
}
