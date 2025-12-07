export interface NarrationData {
  script: NarrationScript;
  audioUrl?: string;
  voiceId: string;
  provider: 'elevenlabs' | 'google' | 'custom';
  speed: number;
  generatedAt?: Date;
}

export interface NarrationScript {
  intro: string;
  photoNarrations: PhotoNarration[];
  ending: string;
  fullScript: string;
}

export interface PhotoNarration {
  photoId: string;
  text: string;
  duration: number;
  startTime?: number;
  endTime?: number;
}

export interface NarrationGenerationRequest {
  projectId: string;
  themeId: string;
  photos: {
    id: string;
    analysis?: {
      description: string;
      mood: string;
      subjects: string[];
    };
  }[];
  customPrompt?: string;
  style?: NarrationStyle;
  language?: string;
}

export type NarrationStyle =
  | 'warm'
  | 'professional'
  | 'energetic'
  | 'emotional'
  | 'playful'
  | 'formal'
  | 'casual'
  | 'poetic';

export interface NarrationGenerationResponse {
  success: boolean;
  script?: NarrationScript;
  error?: string;
}

export interface TTSRequest {
  text: string;
  voiceId: string;
  provider: 'elevenlabs' | 'google';
  speed?: number;
  pitch?: number;
}

export interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  error?: string;
}

export const NARRATION_STYLES = [
  { id: 'warm', name: '따뜻한', nameEn: 'Warm', description: '따뜻하고 감동적인 톤' },
  { id: 'professional', name: '전문적', nameEn: 'Professional', description: '깔끔하고 신뢰감 있는 톤' },
  { id: 'energetic', name: '활기찬', nameEn: 'Energetic', description: '밝고 에너지 넘치는 톤' },
  { id: 'emotional', name: '감성적', nameEn: 'Emotional', description: '감성적이고 서정적인 톤' },
  { id: 'playful', name: '장난스러운', nameEn: 'Playful', description: '재미있고 유쾌한 톤' },
  { id: 'formal', name: '격식있는', nameEn: 'Formal', description: '격식 있고 공식적인 톤' },
  { id: 'casual', name: '일상적', nameEn: 'Casual', description: '편안하고 자연스러운 톤' },
  { id: 'poetic', name: '시적인', nameEn: 'Poetic', description: '운율감 있고 아름다운 톤' },
] as const;
