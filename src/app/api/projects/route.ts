import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/projects - Get all projects for authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: any = { userId: session.user.id };

    if (status) {
      where.status = status;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { [sortBy]: sortOrder },
        include: {
          photos: {
            take: 4,
            orderBy: { order: 'asc' },
            select: { id: true, thumbnailUrl: true },
          },
          _count: {
            select: { photos: true },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      projects: projects.map((p) => ({
        ...p,
        photoCount: p._count.photos,
        thumbnails: p.photos.map((photo) => photo.thumbnailUrl),
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  themeId: z.string().optional(),
  settings: z
    .object({
      aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:3']).optional(),
      fps: z.number().optional(),
      resolution: z.enum(['720p', '1080p', '4k']).optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        title: validated.name,
        userId: session.user.id,
        themeId: validated.themeId || 'elegant-fade', // default theme
        status: 'draft',
        settings: validated.settings || {
          aspectRatio: '16:9',
          fps: 30,
          resolution: '1080p',
        },
        timeline: [],
        audio: {},
        narration: {},
        introConfig: {},
        outroConfig: {},
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
