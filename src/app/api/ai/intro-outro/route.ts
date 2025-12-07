import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateIntroOutro } from '@/services/introOutroGeneration';
import { ALL_THEMES } from '@/constants/themes';
import { z } from 'zod';

const generateIntroOutroSchema = z.object({
  projectId: z.string(),
  regenerate: z.boolean().optional(),
  customPrompts: z
    .object({
      intro: z.string().optional(),
      outro: z.string().optional(),
    })
    .optional(),
});

/**
 * POST /api/ai/intro-outro
 * Generate unique AI intro and outro for a project
 * This ensures each project gets creative, non-repetitive intro/outro content
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = generateIntroOutroSchema.parse(body);

    // Verify project ownership and get data
    const project = await prisma.project.findFirst({
      where: {
        id: validated.projectId,
        userId: session.user.id,
      },
      include: {
        photos: {
          orderBy: { order: 'asc' },
          take: 5, // Use first 5 photos for context
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if intro/outro already exists and regeneration is not requested
    if (
      !validated.regenerate &&
      project.introConfig &&
      Object.keys(project.introConfig as object).length > 0 &&
      project.outroConfig &&
      Object.keys(project.outroConfig as object).length > 0
    ) {
      return NextResponse.json({
        success: true,
        introConfig: project.introConfig,
        outroConfig: project.outroConfig,
        cached: true,
      });
    }

    // Get theme
    const theme = ALL_THEMES.find((t) => t.id === project.themeId);
    if (!theme) {
      return NextResponse.json(
        { error: 'Invalid theme' },
        { status: 400 }
      );
    }

    // Prepare photo analyses for context
    const photoAnalyses = project.photos
      .filter((p) => p.analysis)
      .map((p) => p.analysis as any);

    // Generate unique intro/outro
    const result = await generateIntroOutro(
      {
        projectName: project.name,
        photoCount: project.photos.length,
        photoAnalyses,
        customPrompts: validated.customPrompts,
      },
      theme
    );

    // Update project with generated intro/outro
    const updatedProject = await prisma.project.update({
      where: { id: project.id },
      data: {
        introConfig: result.intro as any,
        outroConfig: result.outro as any,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      introConfig: result.intro,
      outroConfig: result.outro,
      project: updatedProject,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error generating intro/outro:', error);
    return NextResponse.json(
      { error: 'Failed to generate intro/outro' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ai/intro-outro
 * Update intro/outro configuration for a project
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, introConfig, outroConfig } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
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

    // Update intro/outro config
    const updateData: any = { updatedAt: new Date() };
    if (introConfig !== undefined) {
      updateData.introConfig = introConfig;
    }
    if (outroConfig !== undefined) {
      updateData.outroConfig = outroConfig;
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      project: updatedProject,
    });
  } catch (error) {
    console.error('Error updating intro/outro:', error);
    return NextResponse.json(
      { error: 'Failed to update intro/outro' },
      { status: 500 }
    );
  }
}
