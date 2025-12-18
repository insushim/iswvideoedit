import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadImage } from '@/lib/r2';
import { analyzePhoto } from '@/services/photoAnalysis';
import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

// 게스트 사용자 ID 가져오기 또는 생성
async function getOrCreateGuestUser(): Promise<string> {
  let guestId: string;

  try {
    const cookieStore = await cookies();
    guestId = cookieStore.get('guest_id')?.value || `guest_${randomUUID()}`;
  } catch {
    guestId = `guest_${randomUUID()}`;
  }

  try {
    // upsert를 사용하여 동시성 문제 해결
    await prisma.user.upsert({
      where: { id: guestId },
      update: {},
      create: {
        id: guestId,
        email: `${guestId}@guest.local`,
        name: '게스트',
      },
    });
  } catch (error) {
    console.error('Guest user upsert error:', error);
  }

  return guestId;
}

// 사용자 ID 가져오기 (로그인 또는 게스트)
async function getUserId(): Promise<{ userId: string; isGuest: boolean }> {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    return { userId: session.user.id, isGuest: false };
  }

  const guestId = await getOrCreateGuestUser();
  return { userId: guestId, isGuest: true };
}

export async function POST(request: NextRequest) {
  try {
    const { userId, isGuest } = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const projectId = formData.get('projectId') as string;
    const files = formData.getAll('files') as File[];

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // 먼저 프로젝트가 존재하는지 확인
    const projectExists = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true },
    });

    if (!projectExists) {
      return NextResponse.json(
        { error: 'Project not found', projectId },
        { status: 404 }
      );
    }

    // 프로젝트 소유자가 다르면 소유권 이전 (게스트 사용자 간 이동 허용)
    if (projectExists.userId !== userId) {
      // 게스트 사용자인 경우 프로젝트 소유권 업데이트
      if (isGuest && projectExists.userId.startsWith('guest_')) {
        await prisma.project.update({
          where: { id: projectId },
          data: { userId },
        });
      } else {
        return NextResponse.json(
          { error: 'Access denied', yourUserId: userId, projectUserId: projectExists.userId },
          { status: 403 }
        );
      }
    }

    // 프로젝트 조회
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
      include: {
        _count: { select: { photos: true } },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project access failed after ownership check' },
        { status: 500 }
      );
    }

    const uploadedPhotos = [];
    const errors = [];
    let currentOrder = project._count.photos;

    for (const file of files) {
      try {
        // Validate file
        if (!ALLOWED_TYPES.includes(file.type)) {
          errors.push({
            filename: file.name,
            error: 'Invalid file type. Allowed: JPEG, PNG, WebP, HEIC',
          });
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          errors.push({
            filename: file.name,
            error: 'File too large. Maximum size: 20MB',
          });
          continue;
        }

        // Convert to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Generate unique filename
        const fileId = randomUUID();
        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filename = `${userId}/${projectId}/${fileId}.${extension}`;

        // Upload original file and generate thumbnail
        const uploadResult = await uploadImage(buffer, filename, projectId);

        // Create photo record
        const photo = await prisma.photo.create({
          data: {
            projectId,
            url: uploadResult.url,
            originalUrl: uploadResult.url,
            thumbnailUrl: uploadResult.thumbnailUrl,
            width: uploadResult.width,
            height: uploadResult.height,
            order: currentOrder++,
          },
        });

        uploadedPhotos.push(photo);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        errors.push({
          filename: file.name,
          error: 'Failed to upload file',
        });
      }
    }

    // Update project's updated timestamp
    await prisma.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      uploaded: uploadedPhotos,
      errors: errors.length > 0 ? errors : undefined,
      total: uploadedPhotos.length,
    });
  } catch (error) {
    console.error('Error in photo upload:', error);
    return NextResponse.json(
      { error: 'Failed to upload photos' },
      { status: 500 }
    );
  }
}

// Analyze photos with AI
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { photoIds, projectId } = await request.json();

    if (!photoIds || !Array.isArray(photoIds)) {
      return NextResponse.json(
        { error: 'Photo IDs array is required' },
        { status: 400 }
      );
    }

    // Verify ownership and get photos with project
    const photos = await prisma.photo.findMany({
      where: {
        id: { in: photoIds },
        project: {
          userId,
        },
      },
      include: {
        project: true,
      },
    });

    if (photos.length === 0) {
      return NextResponse.json(
        { error: 'No photos found' },
        { status: 404 }
      );
    }

    // Import themes for analysis
    const { themes } = await import('@/data/themes');
    const project = photos[0].project;
    const theme = themes.find((t) => t.id === project.themeId) || themes[0];

    const analyzedPhotos = [];

    for (const photo of photos) {
      try {
        // Analyze photo with Gemini
        const analysis = await analyzePhoto(photo.originalUrl, theme);

        // Update photo with analysis
        const updatedPhoto = await prisma.photo.update({
          where: { id: photo.id },
          data: {
            analysis: JSON.parse(JSON.stringify(analysis)),
          },
        });

        analyzedPhotos.push(updatedPhoto);
      } catch (error) {
        console.error(`Error analyzing photo ${photo.id}:`, error);
      }
    }

    return NextResponse.json({
      analyzed: analyzedPhotos,
      total: analyzedPhotos.length,
    });
  } catch (error) {
    console.error('Error analyzing photos:', error);
    return NextResponse.json(
      { error: 'Failed to analyze photos' },
      { status: 500 }
    );
  }
}
