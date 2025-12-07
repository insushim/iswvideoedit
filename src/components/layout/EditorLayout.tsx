'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  Save,
  Play,
  Download,
  Settings,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  HelpCircle,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/common';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface EditorLayoutProps {
  children: React.ReactNode;
  projectName?: string;
  projectId?: string;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onPreview?: () => void;
  onExport?: () => void;
}

const ToolbarButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  shortcut?: string;
}> = ({ icon, label, onClick, disabled, shortcut }) => (
  <Tooltip.Provider delayDuration={300}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
            disabled
              ? 'cursor-not-allowed text-gray-300 dark:text-gray-600'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          )}
        >
          {icon}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="z-50 rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg dark:bg-gray-700"
          sideOffset={5}
        >
          <div className="flex items-center gap-2">
            <span>{label}</span>
            {shortcut && (
              <kbd className="rounded bg-gray-700 px-1.5 py-0.5 text-xs text-gray-300 dark:bg-gray-600">
                {shortcut}
              </kbd>
            )}
          </div>
          <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  children,
  projectName = '제목 없는 프로젝트',
  projectId,
  isSaving = false,
  hasUnsavedChanges = false,
  canUndo = false,
  canRedo = false,
  onSave,
  onUndo,
  onRedo,
  onPreview,
  onExport,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));

  return (
    <div className="flex h-screen flex-col bg-gray-100 dark:bg-gray-950">
      {/* Editor Header */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Back Button */}
          <Link
            href="/projects"
            className="flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">프로젝트</span>
          </Link>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          {/* Project Name */}
          <div className="flex items-center gap-2">
            <h1 className="max-w-[200px] truncate text-sm font-medium text-gray-900 dark:text-white sm:max-w-none">
              {projectName}
            </h1>
            {hasUnsavedChanges && (
              <span className="h-2 w-2 rounded-full bg-orange-500" title="저장되지 않은 변경사항" />
            )}
            {isSaving && (
              <span className="text-xs text-gray-500 dark:text-gray-400">저장 중...</span>
            )}
          </div>
        </div>

        {/* Center Section - Toolbar */}
        <div className="hidden items-center gap-1 rounded-lg bg-gray-50 p-1 dark:bg-gray-800 md:flex">
          <ToolbarButton
            icon={<Undo className="h-4 w-4" />}
            label="실행 취소"
            shortcut="Ctrl+Z"
            onClick={onUndo}
            disabled={!canUndo}
          />
          <ToolbarButton
            icon={<Redo className="h-4 w-4" />}
            label="다시 실행"
            shortcut="Ctrl+Y"
            onClick={onRedo}
            disabled={!canRedo}
          />
          <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-gray-700" />
          <ToolbarButton
            icon={<ZoomOut className="h-4 w-4" />}
            label="축소"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
          />
          <span className="w-12 text-center text-xs text-gray-600 dark:text-gray-400">
            {zoom}%
          </span>
          <ToolbarButton
            icon={<ZoomIn className="h-4 w-4" />}
            label="확대"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
          />
          <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-gray-700" />
          <ToolbarButton
            icon={isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            label={isFullscreen ? '전체 화면 해제' : '전체 화면'}
            shortcut="F11"
            onClick={toggleFullscreen}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Help Button */}
          <ToolbarButton
            icon={<HelpCircle className="h-4 w-4" />}
            label="도움말"
          />

          {/* Save Button */}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={onSave}
            isLoading={isSaving}
          >
            <span className="hidden sm:inline">저장</span>
          </Button>

          {/* Preview Button */}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Play className="h-4 w-4" />}
            onClick={onPreview}
          >
            <span className="hidden sm:inline">미리보기</span>
          </Button>

          {/* Export Button */}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={onExport}
          >
            <span className="hidden sm:inline">내보내기</span>
          </Button>

          {/* More Options */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[180px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                sideOffset={5}
                align="end"
              >
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Settings className="h-4 w-4" />
                  프로젝트 설정
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  복제하기
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  버전 기록
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  삭제하기
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      {/* Editor Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default EditorLayout;
