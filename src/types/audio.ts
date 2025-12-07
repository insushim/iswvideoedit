export interface AudioSettings {
  backgroundMusic?: BackgroundMusic;
  narrationAudio?: NarrationAudio;
  soundEffects?: SoundEffect[];
  masterVolume: number;
}

export interface BackgroundMusic {
  id: string;
  url: string;
  name: string;
  duration: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  loop: boolean;
  startOffset: number;
  category?: string;
  mood?: string;
  bpm?: number;
  aiGenerated?: boolean;
}

export interface NarrationAudio {
  url: string;
  duration: number;
  volume: number;
  voiceId: string;
  voiceName: string;
  provider: 'elevenlabs' | 'google' | 'custom';
}

export interface SoundEffect {
  id: string;
  url: string;
  name: string;
  startTime: number;
  duration: number;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface MusicPreset {
  id: string;
  name: string;
  nameEn: string;
  url: string;
  duration: number;
  category: MusicCategory;
  mood: string;
  bpm: number;
  tags: string[];
  premium: boolean;
  preview?: string;
}

export type MusicCategory =
  | 'graduation'
  | 'wedding'
  | 'birthday'
  | 'travel'
  | 'corporate'
  | 'celebration'
  | 'emotional'
  | 'upbeat'
  | 'classical'
  | 'ambient'
  | 'kids'
  | 'romantic';

export interface Voice {
  id: string;
  name: string;
  nameEn: string;
  provider: 'elevenlabs' | 'google';
  languageCode: string;
  gender: 'male' | 'female';
  style: string;
  description: string;
  preview?: string;
  premium: boolean;
}

export const MUSIC_CATEGORIES = [
  { id: 'graduation', name: '졸업', nameEn: 'Graduation', icon: '🎓' },
  { id: 'wedding', name: '결혼', nameEn: 'Wedding', icon: '💒' },
  { id: 'birthday', name: '생일', nameEn: 'Birthday', icon: '🎂' },
  { id: 'travel', name: '여행', nameEn: 'Travel', icon: '✈️' },
  { id: 'corporate', name: '기업', nameEn: 'Corporate', icon: '💼' },
  { id: 'celebration', name: '축하', nameEn: 'Celebration', icon: '🎉' },
  { id: 'emotional', name: '감성', nameEn: 'Emotional', icon: '💝' },
  { id: 'upbeat', name: '신나는', nameEn: 'Upbeat', icon: '🎵' },
  { id: 'classical', name: '클래식', nameEn: 'Classical', icon: '🎻' },
  { id: 'ambient', name: '분위기', nameEn: 'Ambient', icon: '🌙' },
  { id: 'kids', name: '어린이', nameEn: 'Kids', icon: '👶' },
  { id: 'romantic', name: '로맨틱', nameEn: 'Romantic', icon: '💕' },
] as const;
