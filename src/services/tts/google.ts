/**
 * Google Cloud Text-to-Speech Service
 * Standard and WaveNet voices with SSML support
 */

export interface GoogleVoice {
  name: string;
  displayName: string;
  description: string;
  gender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  languageCode: string;
  voiceType: 'STANDARD' | 'WAVENET' | 'NEURAL2' | 'STUDIO';
  naturalSampleRateHertz: number;
}

export interface GoogleAudioConfig {
  audioEncoding: 'MP3' | 'LINEAR16' | 'OGG_OPUS' | 'MULAW' | 'ALAW';
  speakingRate?: number; // 0.25 to 4.0, default 1.0
  pitch?: number; // -20.0 to 20.0, default 0.0
  volumeGainDb?: number; // -96.0 to 16.0, default 0.0
  sampleRateHertz?: number;
  effectsProfileId?: string[];
}

export interface SynthesizeSpeechRequest {
  text: string;
  voiceName: string;
  languageCode?: string;
  ssml?: boolean; // If true, text is treated as SSML
  audioConfig?: Partial<GoogleAudioConfig>;
}

export interface SynthesizeSpeechResponse {
  audioBuffer: Buffer;
  contentType: string;
}

// High-quality Korean voices
export const KOREAN_VOICES: GoogleVoice[] = [
  // WaveNet voices (higher quality)
  {
    name: 'ko-KR-Wavenet-A',
    displayName: '서연',
    description: '차분하고 전문적인 여성 음성 (WaveNet)',
    gender: 'FEMALE',
    languageCode: 'ko-KR',
    voiceType: 'WAVENET',
    naturalSampleRateHertz: 24000,
  },
  {
    name: 'ko-KR-Wavenet-B',
    displayName: '민재',
    description: '신뢰감 있는 남성 음성 (WaveNet)',
    gender: 'MALE',
    languageCode: 'ko-KR',
    voiceType: 'WAVENET',
    naturalSampleRateHertz: 24000,
  },
  {
    name: 'ko-KR-Wavenet-C',
    displayName: '유나',
    description: '밝고 친근한 여성 음성 (WaveNet)',
    gender: 'FEMALE',
    languageCode: 'ko-KR',
    voiceType: 'WAVENET',
    naturalSampleRateHertz: 24000,
  },
  {
    name: 'ko-KR-Wavenet-D',
    displayName: '도윤',
    description: '젊고 활기찬 남성 음성 (WaveNet)',
    gender: 'MALE',
    languageCode: 'ko-KR',
    voiceType: 'WAVENET',
    naturalSampleRateHertz: 24000,
  },
  // Neural2 voices (highest quality)
  {
    name: 'ko-KR-Neural2-A',
    displayName: '하린',
    description: '자연스럽고 감성적인 여성 음성 (Neural2)',
    gender: 'FEMALE',
    languageCode: 'ko-KR',
    voiceType: 'NEURAL2',
    naturalSampleRateHertz: 24000,
  },
  {
    name: 'ko-KR-Neural2-B',
    displayName: '시우',
    description: '따뜻하고 안정적인 남성 음성 (Neural2)',
    gender: 'MALE',
    languageCode: 'ko-KR',
    voiceType: 'NEURAL2',
    naturalSampleRateHertz: 24000,
  },
  {
    name: 'ko-KR-Neural2-C',
    displayName: '소율',
    description: '부드럽고 우아한 여성 음성 (Neural2)',
    gender: 'FEMALE',
    languageCode: 'ko-KR',
    voiceType: 'NEURAL2',
    naturalSampleRateHertz: 24000,
  },
  // Standard voices (lower cost)
  {
    name: 'ko-KR-Standard-A',
    displayName: '기본 여성',
    description: '표준 여성 음성',
    gender: 'FEMALE',
    languageCode: 'ko-KR',
    voiceType: 'STANDARD',
    naturalSampleRateHertz: 22050,
  },
  {
    name: 'ko-KR-Standard-B',
    displayName: '기본 남성',
    description: '표준 남성 음성',
    gender: 'MALE',
    languageCode: 'ko-KR',
    voiceType: 'STANDARD',
    naturalSampleRateHertz: 22050,
  },
];

const DEFAULT_AUDIO_CONFIG: GoogleAudioConfig = {
  audioEncoding: 'MP3',
  speakingRate: 1.0,
  pitch: 0.0,
  volumeGainDb: 0.0,
  effectsProfileId: ['headphone-class-device'],
};

class GoogleTTSService {
  private apiKey: string;
  private apiEndpoint: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_CLOUD_API_KEY || '';
    this.apiEndpoint = 'https://texttospeech.googleapis.com/v1/text:synthesize';
  }

  /**
   * Synthesize speech from text
   */
  async synthesizeSpeech(request: SynthesizeSpeechRequest): Promise<SynthesizeSpeechResponse> {
    const { text, voiceName, languageCode = 'ko-KR', ssml = false, audioConfig = {} } = request;

    const voice = KOREAN_VOICES.find((v) => v.name === voiceName);
    const mergedConfig = { ...DEFAULT_AUDIO_CONFIG, ...audioConfig };

    try {
      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: ssml ? { ssml: text } : { text },
          voice: {
            languageCode: voice?.languageCode || languageCode,
            name: voiceName,
          },
          audioConfig: {
            audioEncoding: mergedConfig.audioEncoding,
            speakingRate: mergedConfig.speakingRate,
            pitch: mergedConfig.pitch,
            volumeGainDb: mergedConfig.volumeGainDb,
            sampleRateHertz: mergedConfig.sampleRateHertz,
            effectsProfileId: mergedConfig.effectsProfileId,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `Google TTS API error: ${response.status} - ${error.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      const audioBuffer = Buffer.from(data.audioContent, 'base64');

      return {
        audioBuffer,
        contentType: 'audio/mpeg',
      };
    } catch (error) {
      console.error('Google TTS error:', error);
      throw error;
    }
  }

  /**
   * Generate SSML from plain text with emphasis and pauses
   */
  generateSSML(
    text: string,
    options: {
      emphasis?: 'strong' | 'moderate' | 'reduced';
      pauseBefore?: number; // milliseconds
      pauseAfter?: number;
      speakingRate?: 'slow' | 'medium' | 'fast';
      pitch?: 'low' | 'medium' | 'high';
    } = {}
  ): string {
    const { emphasis, pauseBefore, pauseAfter, speakingRate, pitch } = options;

    let ssml = '<speak>';

    if (pauseBefore) {
      ssml += `<break time="${pauseBefore}ms"/>`;
    }

    // Add prosody if specified
    const prosodyAttrs: string[] = [];
    if (speakingRate) {
      const rateMap = { slow: '80%', medium: '100%', fast: '120%' };
      prosodyAttrs.push(`rate="${rateMap[speakingRate]}"`);
    }
    if (pitch) {
      const pitchMap = { low: '-2st', medium: '0st', high: '+2st' };
      prosodyAttrs.push(`pitch="${pitchMap[pitch]}"`);
    }

    if (prosodyAttrs.length > 0) {
      ssml += `<prosody ${prosodyAttrs.join(' ')}>`;
    }

    if (emphasis) {
      ssml += `<emphasis level="${emphasis}">${this.escapeXml(text)}</emphasis>`;
    } else {
      ssml += this.escapeXml(text);
    }

    if (prosodyAttrs.length > 0) {
      ssml += '</prosody>';
    }

    if (pauseAfter) {
      ssml += `<break time="${pauseAfter}ms"/>`;
    }

    ssml += '</speak>';

    return ssml;
  }

  /**
   * Generate narration SSML for photo story
   */
  generateNarrationSSML(
    segments: Array<{
      text: string;
      type: 'intro' | 'photo' | 'ending';
      emotion?: 'neutral' | 'happy' | 'emotional' | 'exciting';
    }>
  ): string {
    let ssml = '<speak>';

    for (const segment of segments) {
      // Add pause between segments
      if (segment.type !== 'intro') {
        ssml += '<break time="800ms"/>';
      }

      // Adjust prosody based on emotion and type
      let rate = '100%';
      let pitch = '0st';
      let volume = 'medium';

      switch (segment.emotion) {
        case 'happy':
          rate = '105%';
          pitch = '+1st';
          break;
        case 'emotional':
          rate = '90%';
          pitch = '-1st';
          break;
        case 'exciting':
          rate = '110%';
          pitch = '+2st';
          volume = 'loud';
          break;
      }

      // Slower for intro and ending
      if (segment.type === 'intro') {
        rate = '95%';
        ssml += '<break time="500ms"/>';
      } else if (segment.type === 'ending') {
        rate = '90%';
      }

      ssml += `<prosody rate="${rate}" pitch="${pitch}" volume="${volume}">`;
      ssml += this.escapeXml(segment.text);
      ssml += '</prosody>';

      if (segment.type === 'ending') {
        ssml += '<break time="1000ms"/>';
      }
    }

    ssml += '</speak>';

    return ssml;
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<GoogleVoice[]> {
    try {
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/voices?languageCode=ko-KR&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices.map((voice: any) => ({
        name: voice.name,
        displayName: voice.name,
        description: '',
        gender: voice.ssmlGender,
        languageCode: voice.languageCodes[0],
        voiceType: this.getVoiceType(voice.name),
        naturalSampleRateHertz: voice.naturalSampleRateHertz,
      }));
    } catch (error) {
      console.error('Failed to fetch Google voices:', error);
      return KOREAN_VOICES;
    }
  }

  /**
   * Get recommended voice based on theme category
   */
  getRecommendedVoice(
    themeCategory: 'education' | 'family' | 'business' | 'events',
    preferHighQuality: boolean = true
  ): GoogleVoice {
    const recommendations: Record<string, string> = {
      education: preferHighQuality ? 'ko-KR-Neural2-A' : 'ko-KR-Wavenet-A',
      family: preferHighQuality ? 'ko-KR-Neural2-C' : 'ko-KR-Wavenet-C',
      business: preferHighQuality ? 'ko-KR-Neural2-B' : 'ko-KR-Wavenet-B',
      events: preferHighQuality ? 'ko-KR-Neural2-A' : 'ko-KR-Wavenet-D',
    };

    const voiceName = recommendations[themeCategory] || 'ko-KR-Neural2-A';
    return KOREAN_VOICES.find((v) => v.name === voiceName) || KOREAN_VOICES[0];
  }

  private getVoiceType(voiceName: string): GoogleVoice['voiceType'] {
    if (voiceName.includes('Neural2')) return 'NEURAL2';
    if (voiceName.includes('Wavenet')) return 'WAVENET';
    if (voiceName.includes('Studio')) return 'STUDIO';
    return 'STANDARD';
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export const googleTTSService = new GoogleTTSService();
export default googleTTSService;
