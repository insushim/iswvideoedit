import { getVisionModel, fetchImageAsBase64, getImageMimeType, parseJsonResponse } from '@/lib/gemini';
import { Photo, PhotoAnalysis } from '@/types/photo';
import { Theme } from '@/types/theme';

export async function analyzePhoto(
  photoUrl: string,
  theme: Theme
): Promise<PhotoAnalysis> {
  try {
    const model = await getVisionModel();

    const prompt = `당신은 사진 분석 전문가입니다. 이 사진을 분석하여 "${theme.name}" 테마의 영상에 사용할 정보를 추출해주세요.

다음 정보를 JSON 형식으로 반환해주세요:
{
  "description": "사진에 대한 자연스럽고 감동적인 설명 (한국어, 2-3문장)",
  "mood": "사진의 분위기 (예: 행복, 감동, 활기참, 차분한, 신나는, 따뜻한 등)",
  "subjects": ["주요 대상들 (사람, 사물, 장소 등)"],
  "colors": ["주요 색상들"],
  "suggestedEffect": "추천 Ken Burns 효과 (kenburns-zoom-in, kenburns-zoom-out, kenburns-pan-left, kenburns-pan-right, kenburns-pan-up, kenburns-pan-down 중 하나)",
  "suggestedTransition": "다음 사진으로의 추천 전환 효과 (fade, crossDissolve, slideLeft, slideRight, slideUp, zoomIn 중 하나)",
  "timestamp": "추정 시간대 (예: 아침, 오후, 저녁, 밤 또는 알 수 없음)",
  "location": "추정 장소 유형 (예: 실내, 야외, 학교, 공원, 집 등)",
  "scene": "장면 설명 (예: 단체사진, 풍경, 인물, 활동 등)",
  "quality": 사진 품질 점수 (1-10)
}

테마 정보:
- 테마명: ${theme.name}
- 설명: ${theme.description}
- 분위기: ${theme.narrationStyle}

사진의 분위기와 테마에 맞는 효과를 추천해주세요.`;

    const imageData = await fetchImageAsBase64(photoUrl);
    const mimeType = getImageMimeType(photoUrl);

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageData,
        },
      },
    ]);

    const response = result.response.text();
    const analysis = await parseJsonResponse<PhotoAnalysis>(response);

    if (analysis) {
      return analysis;
    }

    return getDefaultAnalysis();
  } catch (error) {
    console.error('Photo analysis error:', error);
    return getDefaultAnalysis();
  }
}

export async function analyzePhotosBatch(
  photos: Photo[],
  theme: Theme
): Promise<PhotoAnalysis[]> {
  const analyses: PhotoAnalysis[] = [];

  // Process in batches of 5 to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < photos.length; i += batchSize) {
    const batch = photos.slice(i, i + batchSize);
    const batchPromises = batch.map((photo) =>
      analyzePhoto(photo.url, theme)
    );
    const batchResults = await Promise.all(batchPromises);
    analyses.push(...batchResults);

    // Small delay between batches
    if (i + batchSize < photos.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return analyses;
}

export async function analyzePhotosForStory(
  photos: Photo[],
  theme: Theme
): Promise<{
  analyses: PhotoAnalysis[];
  storyArc: string;
  suggestedOrder: number[];
}> {
  const analyses = await analyzePhotosBatch(photos, theme);

  // Generate story arc based on analyses
  const model = await getVisionModel();

  const analysesText = analyses
    .map((a, i) => `사진 ${i + 1}: ${a.description} (분위기: ${a.mood})`)
    .join('\n');

  const storyPrompt = `다음 사진들을 분석하여 "${theme.name}" 테마에 맞는 스토리 흐름을 제안해주세요.

사진 분석 결과:
${analysesText}

다음 JSON 형식으로 반환해주세요:
{
  "storyArc": "전체 스토리 흐름에 대한 설명 (한 문단)",
  "suggestedOrder": [권장하는 사진 순서 (인덱스 배열, 0부터 시작)]
}`;

  try {
    const result = await model.generateContent(storyPrompt);
    const response = result.response.text();
    const storyData = await parseJsonResponse<{
      storyArc: string;
      suggestedOrder: number[];
    }>(response);

    return {
      analyses,
      storyArc: storyData?.storyArc || '소중한 순간들의 이야기입니다.',
      suggestedOrder:
        storyData?.suggestedOrder || photos.map((_, i) => i),
    };
  } catch (error) {
    console.error('Story analysis error:', error);
    return {
      analyses,
      storyArc: '소중한 순간들의 이야기입니다.',
      suggestedOrder: photos.map((_, i) => i),
    };
  }
}

function getDefaultAnalysis(): PhotoAnalysis {
  return {
    description: '소중한 순간을 담은 사진입니다.',
    mood: 'neutral',
    subjects: [],
    colors: [],
    suggestedEffect: 'kenburns-zoom-in',
    suggestedTransition: 'crossDissolve',
    timestamp: '알 수 없음',
    location: '알 수 없음',
    scene: '일반',
    quality: 7,
  };
}
