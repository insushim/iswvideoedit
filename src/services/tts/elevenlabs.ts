/**
 * ElevenLabs TTS Service
 * High-quality AI voice synthesis with natural intonation
 */

export interface ElevenLabsVoice {
  voiceId: string;
  name: string;
  description: string;
  gender: 'male' | 'female';
  language: string;
  previewUrl?: string;
}

export interface ElevenLabsSettings {
  stability: number; // 0-1, lower = more expressive, higher = more consistent
  similarityBoost: number; // 0-1, higher = closer to original voice
  style?: number; // 0-1, style exaggeration
  useSpeakerBoost?: boolean;
}

export interface GenerateSpeechRequest {
  text: string;
  voiceId: string;
  settings?: Partial<ElevenLabsSettings>;
  modelId?: string;
}

export interface GenerateSpeechResponse {
  audioBuffer: ArrayBuffer;
  contentType: string;
  duration?: number;
}

// Available Korean voices
export const KOREAN_VOICES: ElevenLabsVoice[] = [
  {
    voiceId: 'pNInz6obpgDQGcFmaJgB', // This would be the actual ElevenLabs voice ID
    name: '지수',
    description: '따뜻하고 차분한 여성 목소리, 나레이션에 적합',
    gender: 'female',
    language: 'ko-KR',
  },
  {
    voiceId: 'TxGEqnHWrfWFTfGW9XjX',
    name: '민준',
    description: '신뢰감 있는 남성 목소리, 공식적인 영상에 적합',
    gender: 'male',
    language: 'ko-KR',
  },
  {
    voiceId: 'VR6AewLTigWG4xSOukaG',
    name: '수아',
    description: '밝고 활기찬 여성 목소리, 가족 영상에 적합',
    gender: 'female',
    language: 'ko-KR',
  },
  {
    voiceId: 'pqHfZKP75CvOlQylNhV4',
    name: '준서',
    description: '젊고 에너지 넘치는 남성 목소리, 이벤트 영상에 적합',
    gender: 'male',
    language: 'ko-KR',
  },
  {
    voiceId: 'onwK4e9ZLuTAKqWW03F9',
    name: '하은',
    description: '부드럽고 감성적인 여성 목소리, 감동적인 영상에 적합',
    gender: 'female',
    language: 'ko-KR',
  },
];

const DEFAULT_SETTINGS: ElevenLabsSettings = {
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0.0,
  useSpeakerBoost: true,
};

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

class ElevenLabsService {
  private apiKey: string;
  private modelId: string;

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    this.modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
  }

  /**
   * Generate speech from text
   */
  async generateSpeech(request: GenerateSpeechRequest): Promise<GenerateSpeechResponse> {
    const { text, voiceId, settings = {}, modelId } = request;

    const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };

    try {
      const response = await fetch(
        `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            Accept: 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: modelId || this.modelId,
            voice_settings: {
              stability: mergedSettings.stability,
              similarity_boost: mergedSettings.similarityBoost,
              style: mergedSettings.style,
              use_speaker_boost: mergedSettings.useSpeakerBoost,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${error.detail?.message || response.statusText}`
        );
      }

      const audioBuffer = await response.arrayBuffer();

      return {
        audioBuffer,
        contentType: 'audio/mpeg',
      };
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw error;
    }
  }

  /**
   * Generate speech with streaming (for real-time playback)
   */
  async generateSpeechStream(
    request: GenerateSpeechRequest
  ): Promise<ReadableStream<Uint8Array>> {
    const { text, voiceId, settings = {}, modelId } = request;

    const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };

    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: modelId || this.modelId,
          voice_settings: {
            stability: mergedSettings.stability,
            similarity_boost: mergedSettings.similarityBoost,
            style: mergedSettings.style,
            use_speaker_boost: mergedSettings.useSpeakerBoost,
          },
        }),
      }
    );

    if (!response.ok || !response.body) {
      throw new Error(`ElevenLabs streaming error: ${response.status}`);
    }

    return response.body;
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices.map((voice: any) => ({
        voiceId: voice.voice_id,
        name: voice.name,
        description: voice.description || '',
        gender: voice.labels?.gender || 'unknown',
        language: voice.labels?.language || 'en',
        previewUrl: voice.preview_url,
      }));
    } catch (error) {
      console.error('Failed to fetch ElevenLabs voices:', error);
      return KOREAN_VOICES; // Fallback to predefined voices
    }
  }

  /**
   * Get subscription info (remaining characters)
   */
  async getSubscriptionInfo(): Promise<{
    characterCount: number;
    characterLimit: number;
    voiceLimit: number;
  }> {
    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/user/subscription`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.status}`);
      }

      const data = await response.json();
      return {
        characterCount: data.character_count || 0,
        characterLimit: data.character_limit || 0,
        voiceLimit: data.voice_limit || 0,
      };
    } catch (error) {
      console.error('Failed to fetch subscription info:', error);
      throw error;
    }
  }

  /**
   * Get recommended voice based on theme and mood
   */
  getRecommendedVoice(
    themeCategory: 'education' | 'family' | 'business' | 'events',
    mood: 'warm' | 'formal' | 'energetic' | 'emotional'
  ): ElevenLabsVoice {
    const recommendations: Record<string, Record<string, string>> = {
      education: {
        warm: '지수',
        formal: '민준',
        energetic: '준서',
        emotional: '하은',
      },
      family: {
        warm: '수아',
        formal: '지수',
        energetic: '수아',
        emotional: '하은',
      },
      business: {
        warm: '지수',
        formal: '민준',
        energetic: '준서',
        emotional: '민준',
      },
      events: {
        warm: '수아',
        formal: '민준',
        energetic: '준서',
        emotional: '하은',
      },
    };

    const voiceName = recommendations[themeCategory]?.[mood] || '지수';
    return KOREAN_VOICES.find((v) => v.name === voiceName) || KOREAN_VOICES[0];
  }
}

export const elevenlabsService = new ElevenLabsService();
export default elevenlabsService;
