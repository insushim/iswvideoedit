export type ExportQuality = 'low' | 'medium' | 'high' | 'ultra';
export type ExportFormat = 'mp4' | 'webm' | 'mov';
export type ExportAspectRatio = '16:9' | '9:16' | '1:1' | '4:3';
export type ExportFPS = 24 | 30 | 60;

export interface ExportSettings {
  quality: ExportQuality;
  format: ExportFormat;
  aspectRatio: ExportAspectRatio;
  fps: ExportFPS;
  watermark?: {
    enabled: boolean;
    text?: string;
    imageUrl?: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    opacity: number;
  };
}

export interface ExportPreset {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  settings: ExportSettings;
  icon: string;
  recommended?: boolean;
}

export interface RenderJob {
  id: string;
  projectId: string;
  status: RenderStatus;
  progress: number;
  quality: ExportQuality;
  format: ExportFormat;
  fps: ExportFPS;
  outputUrl?: string;
  fileSize?: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RenderStatus = 'pending' | 'processing' | 'encoding' | 'completed' | 'failed' | 'cancelled';

export interface RenderProgress {
  jobId: string;
  status: RenderStatus;
  progress: number;
  currentStep?: string;
  estimatedTimeRemaining?: number;
  error?: string;
}

export const QUALITY_SETTINGS: Record<ExportQuality, {
  resolution: { width: number; height: number };
  bitrate: string;
  estimatedSizePerMinute: string;
}> = {
  low: {
    resolution: { width: 1280, height: 720 },
    bitrate: '2.5Mbps',
    estimatedSizePerMinute: '~20MB',
  },
  medium: {
    resolution: { width: 1920, height: 1080 },
    bitrate: '5Mbps',
    estimatedSizePerMinute: '~40MB',
  },
  high: {
    resolution: { width: 1920, height: 1080 },
    bitrate: '10Mbps',
    estimatedSizePerMinute: '~75MB',
  },
  ultra: {
    resolution: { width: 3840, height: 2160 },
    bitrate: '25Mbps',
    estimatedSizePerMinute: '~190MB',
  },
};

export const ASPECT_RATIO_DIMENSIONS: Record<ExportAspectRatio, { width: number; height: number }> = {
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
  '4:3': { width: 1440, height: 1080 },
};

export const EXPORT_PRESETS: ExportPreset[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    nameEn: 'YouTube',
    description: '유튜브 최적화 설정',
    settings: {
      quality: 'high',
      format: 'mp4',
      aspectRatio: '16:9',
      fps: 30,
    },
    icon: '📺',
    recommended: true,
  },
  {
    id: 'shorts',
    name: 'YouTube Shorts / TikTok / Reels',
    nameEn: 'Shorts / TikTok / Reels',
    description: '세로형 숏폼 콘텐츠',
    settings: {
      quality: 'high',
      format: 'mp4',
      aspectRatio: '9:16',
      fps: 30,
    },
    icon: '📱',
  },
  {
    id: 'instagram',
    name: 'Instagram 피드',
    nameEn: 'Instagram Feed',
    description: '인스타그램 정사각형',
    settings: {
      quality: 'high',
      format: 'mp4',
      aspectRatio: '1:1',
      fps: 30,
    },
    icon: '📷',
  },
  {
    id: 'presentation',
    name: '프레젠테이션',
    nameEn: 'Presentation',
    description: '발표용 고화질 영상',
    settings: {
      quality: 'ultra',
      format: 'mp4',
      aspectRatio: '16:9',
      fps: 30,
    },
    icon: '🖥️',
  },
];
