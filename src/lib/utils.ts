import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getInitials(name: string): string {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getVideoResolution(aspectRatio: string, quality: string): { width: number; height: number } {
  const resolutions: Record<string, Record<string, { width: number; height: number }>> = {
    '16:9': {
      low: { width: 1280, height: 720 },
      medium: { width: 1920, height: 1080 },
      high: { width: 1920, height: 1080 },
      ultra: { width: 3840, height: 2160 },
    },
    '9:16': {
      low: { width: 720, height: 1280 },
      medium: { width: 1080, height: 1920 },
      high: { width: 1080, height: 1920 },
      ultra: { width: 2160, height: 3840 },
    },
    '1:1': {
      low: { width: 720, height: 720 },
      medium: { width: 1080, height: 1080 },
      high: { width: 1080, height: 1080 },
      ultra: { width: 2160, height: 2160 },
    },
    '4:3': {
      low: { width: 960, height: 720 },
      medium: { width: 1440, height: 1080 },
      high: { width: 1440, height: 1080 },
      ultra: { width: 2880, height: 2160 },
    },
  };

  return resolutions[aspectRatio]?.[quality] || resolutions['16:9']['high'];
}

export function calculateEstimatedRenderTime(
  photoCount: number,
  duration: number,
  quality: string
): number {
  // Base time in seconds
  const baseTime = 30;
  const perPhotoTime = 5;
  const perSecondTime = 2;

  const qualityMultiplier: Record<string, number> = {
    low: 0.5,
    medium: 1,
    high: 1.5,
    ultra: 3,
  };

  const multiplier = qualityMultiplier[quality] || 1;

  return Math.ceil((baseTime + (photoCount * perPhotoTime) + (duration * perSecondTime)) * multiplier);
}
