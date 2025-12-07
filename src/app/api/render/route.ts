import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createRenderJobSchema = z.object({
  projectId: z.string(),
  settings: z
    .object({
      resolution: z.enum(['720p', '1080p', '4k']).optional(),
      format: z.enum(['mp4', 'webm', 'mov']).optional(),
      quality: z.enum(['draft', 'standard', 'high']).optional(),
    })
    .optional(),
});

/**
 * POST /api/render
 * Create a new render job
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createRenderJobSchema.parse(body);

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: validated.projectId,
        userId: session.user.id,
      },
      include: {
        photos: true,
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

    // Check for existing pending/processing render job
    const existingJob = await prisma.renderJob.findFirst({
      where: {
        projectId: project.id,
        status: { in: ['pending', 'processing'] },
      },
    });

    if (existingJob) {
      return NextResponse.json(
        { error: 'A render job is already in progress', jobId: existingJob.id },
        { status: 409 }
      );
    }

    // Merge settings
    const projectSettings = (project.settings as any) || {};
    const renderSettings = {
      resolution: validated.settings?.resolution || projectSettings.resolution || '1080p',
      format: validated.settings?.format || 'mp4',
      quality: validated.settings?.quality || 'standard',
      aspectRatio: projectSettings.aspectRatio || '16:9',
      fps: projectSettings.fps || 30,
    };

    // Create render job
    const renderJob = await prisma.renderJob.create({
      data: {
        projectId: project.id,
        status: 'pending',
        settings: renderSettings,
        progress: 0,
      },
    });

    // Update project status
    await prisma.project.update({
      where: { id: project.id },
      data: {
        status: 'processing',
        updatedAt: new Date(),
      },
    });

    // In production, you would add the job to a queue here
    // For example with BullMQ:
    // await renderQueue.add('render', { jobId: renderJob.id }, { priority: 1 });

    return NextResponse.json({
      success: true,
      jobId: renderJob.id,
      status: 'pending',
      settings: renderSettings,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating render job:', error);
    return NextResponse.json(
      { error: 'Failed to create render job' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/render
 * Get render jobs for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {
      project: {
        userId: session.user.id,
      },
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      where.status = status;
    }

    const jobs = await prisma.renderJob.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      jobs: jobs.map((job) => ({
        id: job.id,
        projectId: job.projectId,
        projectName: job.project.name,
        status: job.status,
        progress: job.progress,
        outputUrl: job.outputUrl,
        error: job.error,
        settings: job.settings,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching render jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch render jobs' },
      { status: 500 }
    );
  }
}
