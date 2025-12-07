export interface Photo {
  id: string;
  projectId: string;
  url: string;
  thumbnailUrl: string;
  originalUrl: string;
  width: number;
  height: number;
  order: number;
  duration: number;
  effect?: string;
  transition?: string;
  transitionDuration?: number;
  kenBurns?: KenBurnsConfig;
  textOverlay?: TextOverlay;
  analysis?: PhotoAnalysis;
  filters?: PhotoFilters;
  createdAt: Date;
  updatedAt: Date;
}

export interface KenBurnsConfig {
  startScale: number;
  endScale: number;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  easing?: string;
}

export interface TextOverlay {
  id: string;
  text: string;
  position: { x: number; y: number };
  style: TextStyle;
  animation?: string;
  startTime?: number;
  endTime?: number;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  backgroundColor?: string;
  textShadow?: string;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export interface PhotoFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
  hue: number;
  vignette: number;
}

export interface PhotoAnalysis {
  description: string;
  mood: string;
  subjects: string[];
  colors: string[];
  suggestedEffect: string;
  suggestedTransition: string;
  timestamp?: string;
  location?: string;
  faces?: FaceData[];
  objects?: string[];
  scene?: string;
  quality?: number;
}

export interface FaceData {
  id: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks?: {
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    nose: { x: number; y: number };
    leftMouth: { x: number; y: number };
    rightMouth: { x: number; y: number };
  };
  expression?: string;
  age?: number;
  gender?: string;
  personId?: string;
  personName?: string;
}
