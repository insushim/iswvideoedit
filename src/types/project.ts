import { Photo, PhotoAnalysis } from './photo';
import { TimelineData } from './timeline';
import { AudioSettings } from './audio';
import { NarrationData } from './narration';
import { Subtitle } from './effect';

export type ProjectStatus = 'draft' | 'editing' | 'rendering' | 'completed' | 'failed';

export interface ProjectSettings {
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  fps: 24 | 30 | 60;
  format: 'mp4' | 'webm' | 'mov';
  watermark?: WatermarkSettings;
}

export interface WatermarkSettings {
  enabled: boolean;
  text?: string;
  imageUrl?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  size: number;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  themeId: string;
  status: ProjectStatus;

  photos: Photo[];
  timeline?: TimelineData;
  audio?: AudioSettings;
  narration?: NarrationData;
  subtitles?: Subtitle[];
  settings: ProjectSettings;

  thumbnailUrl?: string;
  exportUrl?: string;
  exportedAt?: Date;

  renderJobId?: string;
  renderProgress: number;
  renderError?: string;

  introConfig?: IntroConfig;
  outroConfig?: OutroConfig;

  createdAt: Date;
  updatedAt: Date;
}

export interface IntroConfig {
  style: string;
  title: string;
  subtitle?: string;
  date?: string;
  duration: number;
  customText?: string;
  aiGenerated?: boolean;
  generatedContent?: {
    title: string;
    subtitle: string;
    animation: string;
  };
}

export interface OutroConfig {
  style: string;
  message: string;
  credits?: string[];
  showPhotos: boolean;
  duration: number;
  customText?: string;
  aiGenerated?: boolean;
  generatedContent?: {
    message: string;
    subMessage: string;
    animation: string;
  };
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  version: number;
  data: Partial<Project>;
  createdAt: Date;
  description?: string;
}
