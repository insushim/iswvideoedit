import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface RouteParams {
  params: { id: string };
}

// GET /api/projects/[id] - Get a specific project
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update a project
const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  themeId: z.string().optional(),
  status: z.enum(['draft', 'processing', 'completed', 'failed']).optional(),
  settings: z.record(z.any()).optional(),
  timeline: z.array(z.any()).optional(),
  audio: z.record(z.any()).optional(),
  narration: z.record(z.any()).optional(),
  introConfig: z.record(z.any()).optional(),
  outroConfig: z.record(z.any()).optional(),
  duration: z.number().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existingProject = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = updateProjectSchema.parse(body);

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...validated,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existingProject = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete associated photos first
    await prisma.photo.deleteMany({
      where: { projectId: params.id },
    });

    // Delete the project
    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
