export type EffectType =
  // Ken Burns
  | 'kenburns-zoom-in'
  | 'kenburns-zoom-out'
  | 'kenburns-pan-left'
  | 'kenburns-pan-right'
  | 'kenburns-pan-up'
  | 'kenburns-pan-down'
  | 'kenburns-diagonal-tl'
  | 'kenburns-diagonal-tr'
  | 'kenburns-diagonal-bl'
  | 'kenburns-diagonal-br'
  // Filters
  | 'filter-vignette'
  | 'filter-blur'
  | 'filter-grayscale'
  | 'filter-sepia'
  | 'filter-warm'
  | 'filter-cold'
  | 'filter-vintage'
  | 'filter-dramatic'
  // Particles
  | 'particles-snow'
  | 'particles-hearts'
  | 'particles-stars'
  | 'particles-confetti'
  | 'particles-bubbles'
  | 'particles-fireflies'
  | 'particles-leaves'
  | 'particles-petals';

export interface Effect {
  id: EffectType;
  name: string;
  nameEn: string;
  description: string;
  category: 'kenburns' | 'filter' | 'particles';
  defaultIntensity: number;
  premium: boolean;
  preview?: string;
}

export interface EffectConfig {
  type: EffectType;
  intensity: number;
  duration?: number;
  delay?: number;
  color?: string;
  easing?: string;
}

export interface Subtitle {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  style: SubtitleStyle;
}

export interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  backgroundColor?: string;
  position: 'top' | 'center' | 'bottom';
  alignment: 'left' | 'center' | 'right';
  animation?: 'none' | 'fade' | 'slide' | 'typewriter' | 'bounce';
  outline?: {
    color: string;
    width: number;
  };
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
}

export const EFFECT_CATEGORIES = [
  { id: 'kenburns', name: 'Ken Burns', nameEn: 'Ken Burns' },
  { id: 'filter', name: '필터', nameEn: 'Filters' },
  { id: 'particles', name: '파티클', nameEn: 'Particles' },
] as const;
