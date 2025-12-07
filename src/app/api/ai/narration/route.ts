import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateNarration } from '@/services/narrationGeneration';
import { themes } from '@/data/themes';
import { z } from 'zod';

const generateNarrationSchema = z.object({
  projectId: z.string(),
  style: z.enum(['emotional', 'informative', 'poetic', 'humorous']).optional(),
  language: z.enum(['ko', 'en', 'ja', 'zh']).optional(),
  includeIntro: z.boolean().optional(),
  includeEnding: z.boolean().optional(),
});

/**
 * POST /api/ai/narration
 * Generate AI narration for a project
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = generateNarrationSchema.parse(body);

    // Verify project ownership and get data
    const project = await prisma.project.findFirst({
      where: {
        id: validated.projectId,
        userId: session.user.id,
      },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.photos.length === 0) {
      return NextResponse.json(
        { error: 'Project has no photos' },
        { status: 400 }
      );
    }

    // Get theme
    const theme = themes.find((t) => t.id === project.themeId);
    if (!theme) {
      return NextResponse.json(
        { error: 'Invalid theme' },
        { status: 400 }
      );
    }

    // Prepare photo data for narration generation
    const photoData = project.photos.map((photo) => ({
      id: photo.id,
      url: photo.originalUrl,
      analysis: photo.analysis as any,
      order: photo.order,
    }));

    // Generate narration
    const narrationScript = await generateNarration({
      projectName: project.title,
      theme,
      photos: photoData as any,
      style: (validated.style || 'emotional') as any,
      language: validated.language || 'ko',
      includeIntro: validated.includeIntro !== false,
      includeEnding: validated.includeEnding !== false,
    });

    // Update project with narration
    const updatedProject = await prisma.project.update({
      where: { id: project.id },
      data: {
        narration: narrationScript as any,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      narration: narrationScript,
      project: updatedProject,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error generating narration:', error);
    return NextResponse.json(
      { error: 'Failed to generate narration' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ai/narration
 * Update narration for a project
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, narration } = await request.json();

    if (!projectId || !narration) {
      return NextResponse.json(
        { error: 'Project ID and narration are required' },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update narration
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        narration,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      project: updatedProject,
    });
  } catch (error) {
    console.error('Error updating narration:', error);
    return NextResponse.json(
      { error: 'Failed to update narration' },
      { status: 500 }
    );
  }
}
