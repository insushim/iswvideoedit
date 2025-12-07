import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/render/[id]
 * Get status of a specific render job
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const job = await prisma.renderJob.findFirst({
      where: {
        id: params.id,
      },
    });

    if (job) {
      // Verify project ownership
      const project = await prisma.project.findFirst({
        where: {
          id: job.projectId,
          userId: session.user.id,
        },
      });
      if (!project) {
        return NextResponse.json(
          { error: 'Render job not found' },
          { status: 404 }
        );
      }
    }

    if (!job) {
      return NextResponse.json(
        { error: 'Render job not found' },
        { status: 404 }
      );
    }

    // Get project for name
    const projectData = await prisma.project.findUnique({
      where: { id: job.projectId },
      select: { title: true },
    });

    return NextResponse.json({
      id: job.id,
      projectId: job.projectId,
      projectName: projectData?.title || 'Unknown',
      status: job.status,
      progress: job.progress,
      outputUrl: job.outputUrl,
      error: job.error,
      quality: job.quality,
      fps: job.fps,
      format: job.format,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    });
  } catch (error) {
    console.error('Error fetching render job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch render job' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/render/[id]
 * Cancel a render job (if pending or processing)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const job = await prisma.renderJob.findFirst({
      where: {
        id: params.id,
        project: {
          userId: session.user.id,
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Render job not found' },
        { status: 404 }
      );
    }

    if (job.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cancel completed job' },
        { status: 400 }
      );
    }

    // Update job status to cancelled
    await prisma.renderJob.update({
      where: { id: params.id },
      data: {
        status: 'failed',
        error: 'Cancelled by user',
        completedAt: new Date(),
      },
    });

    // Reset project status
    await prisma.project.update({
      where: { id: job.projectId },
      data: {
        status: 'draft',
        updatedAt: new Date(),
      },
    });

    // In production, you would also remove the job from the queue

    return NextResponse.json({
      success: true,
      message: 'Render job cancelled',
    });
  } catch (error) {
    console.error('Error cancelling render job:', error);
    return NextResponse.json(
      { error: 'Failed to cancel render job' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/render/[id]
 * Update render job status (internal use)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // This endpoint should be protected by an internal API key in production
    const apiKey = request.headers.get('x-api-key');
    const internalKey = process.env.INTERNAL_API_KEY;

    if (!internalKey || apiKey !== internalKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, progress, outputUrl, error } = await request.json();

    const job = await prisma.renderJob.findUnique({
      where: { id: params.id },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Render job not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;

      if (status === 'processing' && !job.startedAt) {
        updateData.startedAt = new Date();
      }

      if (status === 'completed' || status === 'failed') {
        updateData.completedAt = new Date();
      }
    }

    if (progress !== undefined) {
      updateData.progress = progress;
    }

    if (outputUrl) {
      updateData.outputUrl = outputUrl;
    }

    if (error) {
      updateData.error = error;
    }

    const updatedJob = await prisma.renderJob.update({
      where: { id: params.id },
      data: updateData,
    });

    // Update project status if render is complete
    if (status === 'completed') {
      await prisma.project.update({
        where: { id: job.projectId },
        data: {
          status: 'completed',
          outputUrl,
          updatedAt: new Date(),
        },
      });
    } else if (status === 'failed') {
      await prisma.project.update({
        where: { id: job.projectId },
        data: {
          status: 'failed',
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      job: updatedJob,
    });
  } catch (error) {
    console.error('Error updating render job:', error);
    return NextResponse.json(
      { error: 'Failed to update render job' },
      { status: 500 }
    );
  }
}
