import { getGeminiModel, parseJsonResponse } from '@/lib/gemini';
import { Photo, PhotoAnalysis } from '@/types/photo';
import { Theme } from '@/types/theme';
import { NarrationScript, NarrationStyle } from '@/types/narration';

export interface NarrationGenerationOptions {
  photos: Photo[];
  analyses: PhotoAnalysis[];
  theme: Theme;
  projectTitle?: string;
  customPrompt?: string;
  style?: NarrationStyle;
  language?: 'ko' | 'en' | 'ja' | 'zh';
  targetDuration?: number;
}

export async function generateNarration(
  options: NarrationGenerationOptions
): Promise<NarrationScript> {
  const {
    photos,
    analyses,
    theme,
    projectTitle,
    customPrompt,
    style = 'warm',
    language = 'ko',
    targetDuration,
  } = options;

  try {
    const model = await getGeminiModel();

    const photoDescriptions = photos.map((photo, index) => ({
      order: index + 1,
      description: analyses[index]?.description || '사진',
      mood: analyses[index]?.mood || 'neutral',
      subjects: analyses[index]?.subjects || [],
    }));

    const styleDescriptions: Record<NarrationStyle, string> = {
      warm: '따뜻하고 감동적인 톤으로',
      professional: '전문적이고 신뢰감 있는 톤으로',
      energetic: '밝고 에너지 넘치는 톤으로',
      emotional: '감성적이고 서정적인 톤으로',
      playful: '재미있고 유쾌한 톤으로',
      formal: '격식 있고 공식적인 톤으로',
      casual: '편안하고 자연스러운 톤으로',
      poetic: '운율감 있고 아름다운 톤으로',
    };

    const languageInstructions: Record<string, string> = {
      ko: '한국어로 작성해주세요.',
      en: 'Write in English.',
      ja: '日本語で書いてください。',
      zh: '请用中文写。',
    };

    const prompt = `당신은 ${theme.name} 영상의 전문 나레이터입니다.

${theme.narrationPrompt}

**스타일 지시**: ${styleDescriptions[style]}
**언어**: ${languageInstructions[language]}

사진 정보 (${photos.length}장):
${JSON.stringify(photoDescriptions, null, 2)}

테마 정보:
- 이름: ${theme.name}
- 설명: ${theme.description}
- 기본 엔딩: ${theme.defaultEnding}
- 권장 길이: ${targetDuration || theme.suggestedDuration}초

${projectTitle ? `영상 제목: ${projectTitle}` : ''}
${customPrompt ? `추가 요청사항: ${customPrompt}` : ''}

다음 JSON 형식으로 나레이션 스크립트를 작성해주세요:
{
  "intro": "영상 시작 나레이션 (10-15초 분량, 설렘과 기대감을 담아)",
  "photoNarrations": [
    {
      "photoId": "각 사진의 순서 (1부터 시작하는 숫자 문자열)",
      "text": "해당 사진에 맞는 나레이션 (각 3-6초, 사진의 분위기와 의미를 담아)",
      "duration": 예상 읽기 시간(초)
    }
  ],
  "ending": "마무리 나레이션 (10-15초, 감동적인 마무리)",
  "fullScript": "전체 스크립트 연결 (위 모든 내용을 자연스럽게 연결)"
}

주의사항:
1. 각 사진의 나레이션은 해당 사진의 분위기와 내용에 맞게 작성
2. 전체적인 스토리 흐름이 자연스럽게 이어지도록
3. ${style} 스타일에 맞는 어휘와 표현 사용
4. 청자가 공감할 수 있는 진심 어린 표현 사용`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const script = await parseJsonResponse<NarrationScript>(response);

    if (script) {
      // Convert photoId to string if it's a number
      script.photoNarrations = script.photoNarrations.map((pn, index) => ({
        ...pn,
        photoId: photos[index]?.id || String(index + 1),
      }));
      return script;
    }

    return getDefaultNarration(photos, analyses, theme);
  } catch (error) {
    console.error('Narration generation error:', error);
    return getDefaultNarration(photos, analyses, theme);
  }
}

export async function regeneratePhotoNarration(
  photo: Photo,
  analysis: PhotoAnalysis,
  theme: Theme,
  feedback?: string
): Promise<{ text: string; duration: number }> {
  try {
    const model = await getGeminiModel();

    const prompt = `이 사진에 대한 나레이션을 다시 작성해주세요.

사진 정보:
- 설명: ${analysis.description}
- 분위기: ${analysis.mood}
- 주요 대상: ${analysis.subjects.join(', ')}

테마: ${theme.name}
스타일: ${theme.narrationStyle}

${feedback ? `피드백: ${feedback}` : ''}

다음 JSON 형식으로 반환해주세요:
{
  "text": "새로운 나레이션 (3-6초 분량)",
  "duration": 예상 읽기 시간(초)
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const narration = await parseJsonResponse<{ text: string; duration: number }>(
      response
    );

    if (narration) {
      return narration;
    }

    return {
      text: analysis.description || '소중한 순간입니다.',
      duration: 4,
    };
  } catch (error) {
    console.error('Photo narration regeneration error:', error);
    return {
      text: analysis.description || '소중한 순간입니다.',
      duration: 4,
    };
  }
}

function getDefaultNarration(
  photos: Photo[],
  analyses: PhotoAnalysis[],
  theme: Theme
): NarrationScript {
  const intro = `${theme.name} 영상을 시작합니다. 소중한 순간들을 함께 돌아보겠습니다.`;

  const photoNarrations = photos.map((photo, index) => ({
    photoId: photo.id,
    text: analyses[index]?.description || '소중한 순간입니다.',
    duration: 4,
  }));

  const ending = theme.defaultEnding;

  const fullScript = [intro, ...photoNarrations.map((p) => p.text), ending].join(
    ' '
  );

  return {
    intro,
    photoNarrations,
    ending,
    fullScript,
  };
}
