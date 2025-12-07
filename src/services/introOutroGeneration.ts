import { getGeminiModel, parseJsonResponse } from '@/lib/gemini';
import { Theme } from '@/types/theme';
import { PhotoAnalysis } from '@/types/photo';
import {
  AIIntroOutroRequest,
  AIIntroOutroResponse,
  IntroAnimationType,
  OutroAnimationType,
  ParticleConfig,
  THEME_INTRO_MAPPING,
  THEME_OUTRO_MAPPING,
} from '@/types/intro-outro';

export async function generateIntroOutro(
  request: AIIntroOutroRequest,
  theme: Theme
): Promise<AIIntroOutroResponse> {
  try {
    const model = await getGeminiModel();

    // Determine category for animation suggestions
    const category = theme.subCategory || theme.category;
    const suggestedIntros = THEME_INTRO_MAPPING[category] || ['fade-zoom', 'cinematic'];
    const suggestedOutros = THEME_OUTRO_MAPPING[category] || ['fade-out', 'photo-collage'];

    const prompt = `당신은 영상 인트로/아웃트로 전문 크리에이터입니다.
"${request.themeName}" 테마의 영상에 맞는 독창적이고 감동적인 인트로와 아웃트로를 생성해주세요.

**프로젝트 정보:**
- 테마: ${request.themeName}
- 카테고리: ${request.themeCategory}
- 제목: ${request.projectTitle}
- 날짜: ${request.eventDate || '미지정'}
- 주요 인물/대상: ${request.mainSubjects?.join(', ') || '미지정'}
- 분위기: ${request.mood || '기본'}
- 사진 수: ${request.photoCount}장
- 언어: ${request.language === 'ko' ? '한국어' : request.language}

**테마 특성:**
- 기본 인트로 스타일 후보: ${suggestedIntros.join(', ')}
- 기본 아웃트로 스타일 후보: ${suggestedOutros.join(', ')}
- 테마 인트로 프롬프트: ${theme.introPrompts?.join(' | ') || '없음'}
- 테마 아웃트로 프롬프트: ${theme.outroPrompts?.join(' | ') || '없음'}

${request.customMessage ? `사용자 요청: ${request.customMessage}` : ''}

**중요**: 매번 다양하고 창의적인 결과를 생성해주세요. 같은 테마라도 다른 표현을 사용하세요.

다음 JSON 형식으로 반환해주세요:
{
  "intro": {
    "title": "메인 타이틀 (짧고 임팩트 있게, 최대 20자)",
    "subtitle": "서브타이틀 또는 부제목 (감성적으로, 최대 30자)",
    "suggestedAnimation": "추천 애니메이션 (${suggestedIntros.join(', ')} 중 하나)",
    "suggestedDuration": 인트로 길이(초, 4-7 사이),
    "particles": {
      "type": "파티클 타입 (confetti, hearts, stars, bubbles, snow, petals, sparkle, firefly 중 하나 또는 null)",
      "count": 파티클 개수 (30-100),
      "size": { "min": 최소 크기, "max": 최대 크기 },
      "speed": { "min": 최소 속도, "max": 최대 속도 },
      "colors": ["파티클 색상들"],
      "direction": "방향 (up, down, random)"
    },
    "customMessage": "인트로에 표시될 추가 메시지 (선택사항, 없으면 null)"
  },
  "outro": {
    "mainMessage": "메인 마무리 메시지 (감동적으로, 최대 40자)",
    "subMessage": "보조 메시지 (따뜻하게, 최대 30자)",
    "suggestedAnimation": "추천 애니메이션 (${suggestedOutros.join(', ')} 중 하나)",
    "suggestedDuration": 아웃트로 길이(초, 5-8 사이),
    "credits": ["크레딧에 표시될 내용들 (선택사항)"],
    "customMessage": "아웃트로에 표시될 추가 메시지 (선택사항, 없으면 null)"
  }
}

**창의성 가이드라인:**
1. 제목은 테마의 감성을 담되, 진부하지 않게
2. 서브타이틀은 스토리의 시작을 암시
3. 마무리 메시지는 여운이 남도록
4. 파티클은 테마 분위기와 어울리게 (졸업=confetti, 결혼=hearts, 크리스마스=snow 등)
5. 같은 테마라도 다양한 표현과 스타일 사용`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const generated = await parseJsonResponse<AIIntroOutroResponse>(response);

    if (generated) {
      // Validate and normalize the response
      return normalizeIntroOutroResponse(generated, theme, suggestedIntros, suggestedOutros);
    }

    return getDefaultIntroOutro(request, theme);
  } catch (error) {
    console.error('Intro/Outro generation error:', error);
    return getDefaultIntroOutro(request, theme);
  }
}

function normalizeIntroOutroResponse(
  response: AIIntroOutroResponse,
  theme: Theme,
  suggestedIntros: string[],
  suggestedOutros: string[]
): AIIntroOutroResponse {
  // Validate intro animation
  const validIntroAnimations: IntroAnimationType[] = [
    'fade-zoom', 'slide-up', 'particles', 'typewriter', 'cinematic',
    'bounce', 'split', 'reveal', 'glitch', 'wave', 'spiral', 'explosion',
    'elegant-fade', 'dynamic-zoom', 'floating', 'neon-glow', 'handwriting',
    'photo-stack', 'curtain', 'puzzle'
  ];

  const validOutroAnimations: OutroAnimationType[] = [
    'fade-out', 'zoom-out', 'scroll-credits', 'photo-collage', 'heart-gather',
    'fireworks', 'thank-you', 'memories', 'flying-photos', 'mosaic',
    'polaroid-stack', 'ribbon', 'confetti', 'sunset', 'book-close',
    'timeline', 'balloon', 'flower-bloom', 'wave-goodbye', 'film-reel'
  ];

  // Ensure valid animation types
  if (!validIntroAnimations.includes(response.intro.suggestedAnimation as IntroAnimationType)) {
    response.intro.suggestedAnimation = suggestedIntros[0] as IntroAnimationType;
  }

  if (!validOutroAnimations.includes(response.outro.suggestedAnimation as OutroAnimationType)) {
    response.outro.suggestedAnimation = suggestedOutros[0] as OutroAnimationType;
  }

  // Ensure duration is within bounds
  response.intro.suggestedDuration = Math.max(4, Math.min(7, response.intro.suggestedDuration || 5));
  response.outro.suggestedDuration = Math.max(5, Math.min(8, response.outro.suggestedDuration || 6));

  return response;
}

function getDefaultIntroOutro(
  request: AIIntroOutroRequest,
  theme: Theme
): AIIntroOutroResponse {
  const category = theme.subCategory || theme.category;
  const suggestedIntros = THEME_INTRO_MAPPING[category] || ['fade-zoom'];
  const suggestedOutros = THEME_OUTRO_MAPPING[category] || ['fade-out'];

  const defaultParticles: ParticleConfig | undefined = getDefaultParticles(category);

  return {
    intro: {
      title: request.projectTitle || theme.titleTemplate.replace('{name}', ''),
      subtitle: theme.description,
      suggestedAnimation: suggestedIntros[0] as IntroAnimationType,
      suggestedDuration: 5,
      particles: defaultParticles,
      customMessage: undefined,
    },
    outro: {
      mainMessage: theme.defaultEnding.split('\n')[0] || '감사합니다',
      subMessage: theme.defaultEnding.split('\n')[1] || '',
      suggestedAnimation: suggestedOutros[0] as OutroAnimationType,
      suggestedDuration: 6,
      credits: undefined,
      customMessage: undefined,
    },
  };
}

function getDefaultParticles(category: string): ParticleConfig | undefined {
  const particleConfigs: Record<string, ParticleConfig> = {
    graduation: {
      type: 'confetti',
      count: 50,
      size: { min: 5, max: 15 },
      speed: { min: 2, max: 5 },
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'],
      direction: 'down',
    },
    wedding: {
      type: 'hearts',
      count: 30,
      size: { min: 10, max: 25 },
      speed: { min: 1, max: 3 },
      colors: ['#FF6B9D', '#FFA0A0', '#FFB6C1'],
      direction: 'up',
    },
    birthday: {
      type: 'confetti',
      count: 60,
      size: { min: 5, max: 12 },
      speed: { min: 3, max: 6 },
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#DDA0DD'],
      direction: 'down',
    },
    baby: {
      type: 'stars',
      count: 40,
      size: { min: 8, max: 20 },
      speed: { min: 1, max: 2 },
      colors: ['#FFD700', '#FFA500', '#FFE4B5'],
      direction: 'random',
    },
    holiday: {
      type: 'snow',
      count: 80,
      size: { min: 3, max: 10 },
      speed: { min: 1, max: 3 },
      colors: ['#FFFFFF', '#E0E0E0', '#F5F5F5'],
      direction: 'down',
    },
  };

  return particleConfigs[category];
}

export async function regenerateIntro(
  request: AIIntroOutroRequest,
  theme: Theme,
  feedback?: string
): Promise<AIIntroOutroResponse['intro']> {
  const fullResponse = await generateIntroOutro(
    {
      ...request,
      customMessage: feedback
        ? `${request.customMessage || ''} 피드백: ${feedback}`
        : request.customMessage,
    },
    theme
  );
  return fullResponse.intro;
}

export async function regenerateOutro(
  request: AIIntroOutroRequest,
  theme: Theme,
  feedback?: string
): Promise<AIIntroOutroResponse['outro']> {
  const fullResponse = await generateIntroOutro(
    {
      ...request,
      customMessage: feedback
        ? `${request.customMessage || ''} 피드백: ${feedback}`
        : request.customMessage,
    },
    theme
  );
  return fullResponse.outro;
}
