export type TransitionType =
  // Basic
  | 'none'
  | 'fade'
  | 'crossDissolve'
  // Slide
  | 'slideLeft'
  | 'slideRight'
  | 'slideUp'
  | 'slideDown'
  // Wipe
  | 'wipe'
  | 'circleWipe'
  | 'diamondWipe'
  | 'heartWipe'
  | 'starWipe'
  // Zoom & Spin
  | 'zoomIn'
  | 'zoomOut'
  | 'spin'
  | 'spinZoom'
  // Flip
  | 'flipHorizontal'
  | 'flipVertical'
  // Creative
  | 'glitch'
  | 'pixelate'
  | 'morph'
  | 'ripple'
  | 'lightLeak'
  | 'blur'
  | 'dissolveParticles';

export interface Transition {
  id: TransitionType;
  name: string;
  nameEn: string;
  description: string;
  category: 'basic' | 'slide' | 'wipe' | 'zoom' | 'flip' | 'creative';
  defaultDuration: number;
  minDuration: number;
  maxDuration: number;
  premium: boolean;
  preview?: string;
  icon?: string;
}

export interface TransitionConfig {
  type: TransitionType;
  duration: number;
  easing?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
  intensity?: number;
  color?: string;
}

export const TRANSITION_CATEGORIES = [
  { id: 'basic', name: '기본', nameEn: 'Basic' },
  { id: 'slide', name: '슬라이드', nameEn: 'Slide' },
  { id: 'wipe', name: '와이프', nameEn: 'Wipe' },
  { id: 'zoom', name: '줌/회전', nameEn: 'Zoom & Spin' },
  { id: 'flip', name: '뒤집기', nameEn: 'Flip' },
  { id: 'creative', name: '크리에이티브', nameEn: 'Creative' },
] as const;
