export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  gradient: string;
}

export interface ThemeFonts {
  title: string;
  body: string;
  accent: string;
}

export interface ThemeIntroStyle {
  type:
    | 'fade-zoom'
    | 'slide-up'
    | 'particles'
    | 'typewriter'
    | 'cinematic'
    | 'bounce'
    | 'split'
    | 'reveal'
    | 'glitch'
    | 'wave'
    | 'spiral'
    | 'explosion'
    | 'elegant-fade'
    | 'dynamic-zoom'
    | 'floating'
    | 'neon-glow'
    | 'handwriting'
    | 'photo-stack'
    | 'curtain'
    | 'puzzle';
  duration: number;
  elements: ('title' | 'subtitle' | 'date' | 'logo' | 'particles' | 'gradient-bg')[];
  animation: {
    titleDelay: number;
    subtitleDelay: number;
    easing: string;
  };
}

export interface ThemeOutroStyle {
  type:
    | 'fade-out'
    | 'zoom-out'
    | 'scroll-credits'
    | 'photo-collage'
    | 'heart-gather'
    | 'fireworks'
    | 'thank-you'
    | 'memories'
    | 'flying-photos'
    | 'mosaic'
    | 'polaroid-stack'
    | 'ribbon'
    | 'confetti'
    | 'sunset'
    | 'book-close'
    | 'timeline'
    | 'balloon'
    | 'flower-bloom'
    | 'wave-goodbye'
    | 'film-reel';
  duration: number;
  elements: ('message' | 'credits' | 'photos' | 'logo' | 'social' | 'qr-code' | 'qrCode')[];
  animation: {
    messageDelay: number;
    photosDelay: number;
    easing: string;
  };
}

export interface Theme {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  emoji: string;
  description: string;
  category: 'education' | 'family' | 'business' | 'event';
  subCategory: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  defaultMusic: string;
  defaultTransition: string;
  defaultEffect: string;
  titleTemplate: string;
  defaultEnding: string;
  narrationPrompt: string;
  narrationStyle: string;
  suggestedDuration: number;
  suggestedPhotoCount: { min: number; max: number };
  tags: string[];
  premium: boolean;
  introStyles: ThemeIntroStyle[];
  outroStyles: ThemeOutroStyle[];
  introPrompts: string[];
  outroPrompts: string[];
  // API 응답에서 사용되는 추가 속성들
  transitions?: string[];
  effects?: string[];
  musicGenres?: string[];
  thumbnail?: string;
  isPremium?: boolean;
  keywords?: string[];
}

export interface ThemeCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  themes: Theme[];
}
