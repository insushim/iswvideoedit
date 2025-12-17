import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

// 게스트 사용자 ID 가져오기 또는 생성
async function getOrCreateGuestUser(): Promise<string> {
  let guestId: string;

  try {
    const cookieStore = await cookies();
    guestId = cookieStore.get('guest_id')?.value || `guest_${randomUUID()}`;
  } catch {
    // cookies() 호출 실패 시 새 ID 생성
    guestId = `guest_${randomUUID()}`;
  }

  try {
    // upsert를 사용하여 동시성 문제 해결
    await prisma.user.upsert({
      where: { id: guestId },
      update: {}, // 이미 존재하면 아무것도 업데이트하지 않음
      create: {
        id: guestId,
        email: `${guestId}@guest.local`,
        name: '게스트',
      },
    });
  } catch (error) {
    // upsert도 실패하면 로그만 남기고 계속 진행
    console.error('Guest user upsert error:', error);
  }

  return guestId;
}

// 사용자 ID 가져오기 (로그인 또는 게스트)
async function getUserId(request: NextRequest): Promise<{ userId: string; isGuest: boolean }> {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    return { userId: session.user.id, isGuest: false };
  }

  const guestId = await getOrCreateGuestUser();
  return { userId: guestId, isGuest: true };
}

// GET /api/projects - Get all projects for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId, isGuest } = await getUserId(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: any = { userId };

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
    const { userId, isGuest } = await getUserId(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        title: validated.name,
        userId,
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

    const response = NextResponse.json(project, { status: 201 });

    // 게스트 사용자인 경우 쿠키 설정
    if (isGuest) {
      response.cookies.set('guest_id', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30일
        path: '/',
      });
    }

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error creating project:', errorMessage, error);
    return NextResponse.json(
      { error: 'Failed to create project', details: errorMessage },
      { status: 500 }
    );
  }
}
