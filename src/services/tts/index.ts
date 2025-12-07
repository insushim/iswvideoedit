/**
 * Unified TTS Service
 * Provides a single interface for multiple TTS providers
 */

import elevenlabsService, {
  ElevenLabsVoice,
  KOREAN_VOICES as ELEVENLABS_VOICES,
} from './elevenlabs';
import googleTTSService, {
  GoogleVoice,
  KOREAN_VOICES as GOOGLE_VOICES,
} from './google';

export type TTSProvider = 'elevenlabs' | 'google';

export interface UnifiedVoice {
  id: string;
  provider: TTSProvider;
  name: string;
  displayName: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
  language: string;
  quality: 'standard' | 'premium' | 'ultra';
  previewUrl?: string;
}

export interface GenerateAudioRequest {
  text: string;
  voiceId: string;
  provider: TTSProvider;
  options?: {
    speakingRate?: number;
    pitch?: number;
    emotion?: 'neutral' | 'happy' | 'emotional' | 'exciting';
  };
}

export interface GenerateAudioResponse {
  audioBuffer: Buffer | ArrayBuffer;
  contentType: string;
  duration?: number;
  provider: TTSProvider;
}

/**
 * Get all available voices from all providers
 */
export function getAllVoices(): UnifiedVoice[] {
  const voices: UnifiedVoice[] = [];

  // Add ElevenLabs voices
  for (const voice of ELEVENLABS_VOICES) {
    voices.push({
      id: voice.voiceId,
      provider: 'elevenlabs',
      name: voice.name,
      displayName: voice.name,
      description: voice.description,
      gender: voice.gender,
      language: voice.language,
      quality: 'ultra',
      previewUrl: voice.previewUrl,
    });
  }

  // Add Google voices
  for (const voice of GOOGLE_VOICES) {
    voices.push({
      id: voice.name,
      provider: 'google',
      name: voice.name,
      displayName: voice.displayName,
      description: voice.description,
      gender: voice.gender.toLowerCase() as 'male' | 'female' | 'neutral',
      language: voice.languageCode,
      quality: voice.voiceType === 'NEURAL2' ? 'premium' : voice.voiceType === 'WAVENET' ? 'premium' : 'standard',
    });
  }

  return voices;
}

/**
 * Get voices by provider
 */
export function getVoicesByProvider(provider: TTSProvider): UnifiedVoice[] {
  return getAllVoices().filter((v) => v.provider === provider);
}

/**
 * Get recommended voice for a theme
 */
export function getRecommendedVoice(
  themeCategory: 'education' | 'family' | 'business' | 'events',
  preferredProvider: TTSProvider = 'elevenlabs',
  preferredGender?: 'male' | 'female'
): UnifiedVoice {
  const voices = getAllVoices().filter((v) => v.provider === preferredProvider);

  // Filter by gender if specified
  let filteredVoices = preferredGender
    ? voices.filter((v) => v.gender === preferredGender)
    : voices;

  if (filteredVoices.length === 0) {
    filteredVoices = voices;
  }

  // Return highest quality voice
  const sortedVoices = filteredVoices.sort((a, b) => {
    const qualityOrder = { ultra: 0, premium: 1, standard: 2 };
    return qualityOrder[a.quality] - qualityOrder[b.quality];
  });

  return sortedVoices[0] || getAllVoices()[0];
}

/**
 * Generate audio from text using the specified provider
 */
export async function generateAudio(
  request: GenerateAudioRequest
): Promise<GenerateAudioResponse> {
  const { text, voiceId, provider, options = {} } = request;

  if (provider === 'elevenlabs') {
    const response = await elevenlabsService.generateSpeech({
      text,
      voiceId,
      settings: {
        stability: options.emotion === 'emotional' ? 0.3 : 0.5,
        similarityBoost: 0.75,
        style: options.emotion === 'exciting' ? 0.5 : 0,
      },
    });

    return {
      audioBuffer: response.audioBuffer,
      contentType: response.contentType,
      provider: 'elevenlabs',
    };
  } else {
    // Google TTS
    const ssml = options.emotion
      ? googleTTSService.generateSSML(text, {
          speakingRate:
            options.emotion === 'exciting'
              ? 'fast'
              : options.emotion === 'emotional'
              ? 'slow'
              : 'medium',
          pitch:
            options.emotion === 'happy'
              ? 'high'
              : options.emotion === 'emotional'
              ? 'low'
              : 'medium',
        })
      : undefined;

    const response = await googleTTSService.synthesizeSpeech({
      text: ssml || text,
      voiceName: voiceId,
      ssml: !!ssml,
      audioConfig: {
        speakingRate: options.speakingRate || 1.0,
        pitch: options.pitch || 0,
      },
    });

    return {
      audioBuffer: response.audioBuffer,
      contentType: response.contentType,
      provider: 'google',
    };
  }
}

/**
 * Generate narration audio for a photo story
 */
export async function generateNarrationAudio(
  segments: Array<{
    text: string;
    type: 'intro' | 'photo' | 'ending';
    emotion?: 'neutral' | 'happy' | 'emotional' | 'exciting';
  }>,
  voiceId: string,
  provider: TTSProvider
): Promise<GenerateAudioResponse[]> {
  const results: GenerateAudioResponse[] = [];

  for (const segment of segments) {
    const response = await generateAudio({
      text: segment.text,
      voiceId,
      provider,
      options: {
        emotion: segment.emotion,
      },
    });
    results.push(response);
  }

  return results;
}

/**
 * Estimate the cost of generating audio
 */
export function estimateCost(
  text: string,
  provider: TTSProvider,
  voiceQuality: 'standard' | 'premium' | 'ultra' = 'premium'
): { characters: number; estimatedCost: number; currency: string } {
  const charCount = text.length;

  if (provider === 'elevenlabs') {
    // ElevenLabs pricing: roughly $0.30 per 1000 characters
    return {
      characters: charCount,
      estimatedCost: (charCount / 1000) * 0.3,
      currency: 'USD',
    };
  } else {
    // Google pricing varies by voice type
    const rates = {
      standard: 0.000004, // $4 per 1M characters
      premium: 0.000016, // $16 per 1M characters (WaveNet/Neural2)
      ultra: 0.000016,
    };
    return {
      characters: charCount,
      estimatedCost: charCount * rates[voiceQuality],
      currency: 'USD',
    };
  }
}

export { elevenlabsService, googleTTSService };
export type { ElevenLabsVoice, GoogleVoice };
