import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ConfirmRequest {
  projectId: string;
  photos: Array<{
    id: string;
    key: string;
    thumbnailKey: string;
    publicUrl: string;
    thumbnailPublicUrl: string;
    width: number;
    height: number;
  }>;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmRequest = await request.json();
    const { projectId, photos } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'No photos provided' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 프로젝트 확인 및 현재 사진 수 조회
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: { select: { photos: true } },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    let currentOrder = project._count.photos;
    const createdPhotos = [];

    // 트랜잭션으로 모든 사진 레코드 생성
    for (const photo of photos) {
      const createdPhoto = await prisma.photo.create({
        data: {
          projectId,
          url: photo.publicUrl,
          originalUrl: photo.publicUrl,
          thumbnailUrl: photo.thumbnailPublicUrl,
          width: photo.width || 0,
          height: photo.height || 0,
          order: currentOrder++,
        },
      });
      createdPhotos.push(createdPhoto);
    }

    // 프로젝트 업데이트 타임스탬프 갱신
    await prisma.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(
      {
        uploaded: createdPhotos,
        total: createdPhotos.length,
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error confirming photo uploads:', error);
    return NextResponse.json(
      { error: 'Failed to confirm uploads' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
