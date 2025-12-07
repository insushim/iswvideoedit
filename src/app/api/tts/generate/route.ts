import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateAudio, getAllVoices, getRecommendedVoice, TTSProvider } from '@/services/tts';
import { uploadToR2 } from '@/lib/r2';
import { randomUUID } from 'crypto';
import { z } from 'zod';

const generateTTSSchema = z.object({
  projectId: z.string(),
  segments: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      type: z.enum(['intro', 'photo', 'ending']),
      emotion: z.enum(['neutral', 'happy', 'emotional', 'exciting']).optional(),
    })
  ),
  voiceId: z.string().optional(),
  provider: z.enum(['elevenlabs', 'google']).optional(),
});

/**
 * POST /api/tts/generate
 * Generate TTS audio for narration segments
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = generateTTSSchema.parse(body);

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: validated.projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Determine voice and provider
    const provider: TTSProvider = validated.provider || 'google';
    let voiceId = validated.voiceId;

    if (!voiceId) {
      // Get recommended voice based on theme
      const themeCategory = getThemeCategory(project.themeId);
      const recommendedVoice = getRecommendedVoice(themeCategory, provider);
      voiceId = recommendedVoice.id;
    }

    const generatedAudio = [];

    for (const segment of validated.segments) {
      try {
        // Generate audio for segment
        const response = await generateAudio({
          text: segment.text,
          voiceId,
          provider,
          options: {
            emotion: segment.emotion,
          },
        });

        // Convert ArrayBuffer to Buffer if needed
        const audioBuffer = Buffer.isBuffer(response.audioBuffer)
          ? response.audioBuffer
          : Buffer.from(response.audioBuffer);

        // Upload audio to R2
        const filename = `${session.user.id}/${project.id}/narration/${segment.id}-${randomUUID()}.mp3`;
        const { url } = await uploadToR2(audioBuffer, filename, 'audio/mpeg');

        generatedAudio.push({
          segmentId: segment.id,
          type: segment.type,
          audioUrl: url,
          duration: estimateAudioDuration(segment.text),
        });
      } catch (error) {
        console.error(`Error generating TTS for segment ${segment.id}:`, error);
        generatedAudio.push({
          segmentId: segment.id,
          type: segment.type,
          error: 'Failed to generate audio',
        });
      }
    }

    // Update project with audio data
    const existingAudio = (project.audio as any) || {};
    const updatedAudio = {
      ...existingAudio,
      narration: generatedAudio.filter((a) => !a.error),
      voiceId,
      provider,
    };

    await prisma.project.update({
      where: { id: project.id },
      data: {
        audio: updatedAudio,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      audio: generatedAudio,
      voiceId,
      provider,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error generating TTS:', error);
    return NextResponse.json(
      { error: 'Failed to generate TTS' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tts/generate
 * Get available voices
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') as TTSProvider | null;

    const voices = getAllVoices();
    const filteredVoices = provider
      ? voices.filter((v) => v.provider === provider)
      : voices;

    return NextResponse.json({
      voices: filteredVoices,
    });
  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}

// Helper functions
function getThemeCategory(
  themeId: string
): 'education' | 'family' | 'business' | 'events' {
  if (themeId.includes('graduation') || themeId.includes('school')) {
    return 'education';
  }
  if (
    themeId.includes('wedding') ||
    themeId.includes('birthday') ||
    themeId.includes('baby') ||
    themeId.includes('family')
  ) {
    return 'family';
  }
  if (themeId.includes('company') || themeId.includes('corporate')) {
    return 'business';
  }
  return 'events';
}

function estimateAudioDuration(text: string): number {
  // Estimate based on average speaking rate (about 150 words per minute for Korean)
  // Korean characters count approximately
  const koreanChars = (text.match(/[\uAC00-\uD7AF]/g) || []).length;
  const otherChars = text.length - koreanChars;

  // Korean is spoken at about 5-6 characters per second
  // English is spoken at about 15 characters per second
  const koreanTime = koreanChars / 5.5;
  const otherTime = otherChars / 15;

  return Math.ceil((koreanTime + otherTime) * 1000); // Return in milliseconds
}
