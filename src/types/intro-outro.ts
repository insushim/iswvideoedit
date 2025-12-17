// AI가 생성하는 다양한 인트로/아웃트로 스타일 정의

export type IntroAnimationType =
  | 'fade-zoom'        // 페이드인 + 줌
  | 'slide-up'         // 아래에서 위로 슬라이드
  | 'particles'        // 파티클 효과와 함께
  | 'typewriter'       // 타자기 효과
  | 'cinematic'        // 시네마틱 레터박스
  | 'bounce'           // 바운스 효과
  | 'split'            // 화면 분할 등장
  | 'reveal'           // 마스크 리빌
  | 'glitch'           // 글리치 효과
  | 'wave'             // 웨이브 효과
  | 'spiral'           // 스파이럴 등장
  | 'explosion'        // 폭발적 등장
  | 'elegant-fade'     // 우아한 페이드
  | 'dynamic-zoom'     // 역동적 줌
  | 'floating'         // 떠다니는 효과
  | 'neon-glow'        // 네온 글로우
  | 'handwriting'      // 손글씨 효과
  | 'photo-stack'      // 사진 스택
  | 'curtain'          // 커튼 오픈
  | 'puzzle';          // 퍼즐 조각

export type OutroAnimationType =
  | 'fade-out'         // 페이드 아웃
  | 'zoom-out'         // 줌 아웃
  | 'scroll-credits'   // 크레딧 스크롤
  | 'photo-collage'    // 사진 콜라주
  | 'heart-gather'     // 하트로 모이기
  | 'fireworks'        // 불꽃놀이
  | 'thank-you'        // 감사 메시지
  | 'memories'         // 추억 회상
  | 'flying-photos'    // 날아가는 사진
  | 'mosaic'           // 모자이크
  | 'polaroid-stack'   // 폴라로이드 스택
  | 'ribbon'           // 리본 효과
  | 'confetti'         // 색종이 효과
  | 'sunset'           // 일몰 효과
  | 'book-close'       // 책 닫기
  | 'timeline'         // 타임라인 회상
  | 'balloon'          // 풍선 효과
  | 'flower-bloom'     // 꽃 피우기
  | 'wave-goodbye'     // 손 흔들기
  | 'film-reel';       // 필름 릴

export interface IntroTemplate {
  id: string;
  name: string;
  nameEn: string;
  animationType: IntroAnimationType;
  duration: number;
  elements: IntroElement[];
  colorScheme: 'theme' | 'custom';
  customColors?: {
    background: string;
    primary: string;
    secondary: string;
    text: string;
  };
  particleConfig?: ParticleConfig;
  soundEffect?: string;
  premium: boolean;
  previewUrl?: string;
}

export interface OutroTemplate {
  id: string;
  name: string;
  nameEn: string;
  animationType: OutroAnimationType;
  duration: number;
  elements: OutroElement[];
  colorScheme: 'theme' | 'custom';
  customColors?: {
    background: string;
    primary: string;
    secondary: string;
    text: string;
  };
  showPhotos: boolean;
  photoCount?: number;
  soundEffect?: string;
  premium: boolean;
  previewUrl?: string;
}

export interface IntroElement {
  type: 'title' | 'subtitle' | 'date' | 'logo' | 'particles' | 'background' | 'decoration';
  content?: string;
  animation: {
    type: string;
    delay: number;
    duration: number;
    easing: string;
  };
  style?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number;
    color?: string;
    position?: { x: number; y: number };
    opacity?: number;
  };
}

export interface OutroElement {
  type: 'message' | 'credits' | 'photos' | 'logo' | 'social' | 'qrCode' | 'decoration';
  content?: string;
  animation: {
    type: string;
    delay: number;
    duration: number;
    easing: string;
  };
  style?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number;
    color?: string;
    position?: { x: number; y: number };
    opacity?: number;
  };
}

export interface ParticleConfig {
  type: 'confetti' | 'hearts' | 'stars' | 'bubbles' | 'snow' | 'petals' | 'sparkle' | 'firefly';
  count: number;
  size: { min: number; max: number };
  speed: { min: number; max: number };
  colors: string[];
  direction: 'up' | 'down' | 'left' | 'right' | 'random';
}

// AI가 테마와 상황에 맞게 생성할 인트로/아웃트로 프롬프트
export interface AIIntroOutroRequest {
  themeId: string;
  themeName: string;
  themeCategory: string;
  projectTitle: string;
  eventDate?: string;
  mainSubjects?: string[]; // 사진 분석에서 추출한 주요 인물/대상
  mood?: string;
  photoCount: number;
  customMessage?: string;
  language: 'ko' | 'en' | 'ja' | 'zh';
}

export interface AIIntroOutroResponse {
  intro: {
    title: string;
    subtitle: string;
    suggestedAnimation: IntroAnimationType;
    suggestedDuration: number;
    particles?: ParticleConfig;
    customMessage?: string;
  };
  outro: {
    mainMessage: string;
    subMessage: string;
    suggestedAnimation: OutroAnimationType;
    suggestedDuration: number;
    credits?: string[];
    customMessage?: string;
  };
}

// 테마별 기본 인트로/아웃트로 매핑
export const THEME_INTRO_MAPPING: Record<string, IntroAnimationType[]> = {
  'graduation': ['cinematic', 'typewriter', 'photo-stack', 'elegant-fade'],
  'wedding': ['elegant-fade', 'particles', 'curtain', 'floating'],
  'birthday': ['bounce', 'explosion', 'particles', 'neon-glow'],
  'baby': ['floating', 'particles', 'wave', 'elegant-fade'],
  'travel': ['dynamic-zoom', 'slide-up', 'photo-stack', 'cinematic'],
  'business': ['slide-up', 'reveal', 'typewriter', 'cinematic'],
  'memorial': ['elegant-fade', 'fade-zoom', 'floating', 'cinematic'],
  'sports': ['dynamic-zoom', 'explosion', 'glitch', 'split'],
  'holiday': ['particles', 'bounce', 'wave', 'explosion'],
};

export const THEME_OUTRO_MAPPING: Record<string, OutroAnimationType[]> = {
  'graduation': ['scroll-credits', 'photo-collage', 'timeline', 'fireworks'],
  'wedding': ['heart-gather', 'polaroid-stack', 'flower-bloom', 'fade-out'],
  'birthday': ['confetti', 'balloon', 'fireworks', 'photo-collage'],
  'baby': ['memories', 'polaroid-stack', 'heart-gather', 'fade-out'],
  'travel': ['photo-collage', 'mosaic', 'flying-photos', 'timeline'],
  'business': ['fade-out', 'zoom-out', 'scroll-credits', 'thank-you'],
  'memorial': ['fade-out', 'memories', 'timeline', 'sunset'],
  'sports': ['fireworks', 'photo-collage', 'confetti', 'zoom-out'],
  'holiday': ['confetti', 'fireworks', 'photo-collage', 'wave-goodbye'],
};
