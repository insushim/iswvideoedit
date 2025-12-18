import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';

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

  // 사용자 생성/확인 - upsert 사용
  await prisma.user.upsert({
    where: { id: guestId },
    update: {}, // 이미 존재하면 아무것도 하지 않음
    create: {
      id: guestId,
      email: `${guestId}@guest.local`,
      name: '게스트',
    },
  });

  return guestId;
}

// 사용자 ID 가져오기 (로그인 또는 게스트)
async function getUserId(): Promise<{ userId: string; isGuest: boolean }> {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.id) {
      return { userId: session.user.id, isGuest: false };
    }
  } catch (error) {
    console.error('Session fetch error:', error);
  }

  const guestId = await getOrCreateGuestUser();
  return { userId: guestId, isGuest: true };
}

// GET /api/projects - Get all projects for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await getUserId();

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
    const { userId, isGuest } = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '요청 본문이 올바르지 않습니다' },
        { status: 400 }
      );
    }

    const result = createProjectSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.errors },
        { status: 400 }
      );
    }

    const validated = result.data;

    // 기본 설정값
    const defaultSettings = {
      aspectRatio: '16:9',
      fps: 30,
      resolution: '1080p',
    };

    const project = await prisma.project.create({
      data: {
        title: validated.name,
        userId,
        themeId: validated.themeId || 'elegant-fade',
        status: 'draft',
        settings: validated.settings
          ? { ...defaultSettings, ...validated.settings }
          : defaultSettings,
        timeline: Prisma.JsonNull,
        audio: Prisma.JsonNull,
        narration: Prisma.JsonNull,
        introConfig: Prisma.JsonNull,
        outroConfig: Prisma.JsonNull,
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error creating project:', {
      message: errorMessage,
      stack: errorStack,
      error,
    });

    // Prisma 관련 에러 처리
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: '중복된 데이터가 있습니다' },
          { status: 409 }
        );
      }
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: '참조하는 데이터가 존재하지 않습니다' },
          { status: 400 }
        );
      }
    }

    // 데이터베이스 연결 오류
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: '데이터베이스 연결 오류가 발생했습니다' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: '프로젝트 생성에 실패했습니다', details: errorMessage },
      { status: 500 }
    );
  }
}
