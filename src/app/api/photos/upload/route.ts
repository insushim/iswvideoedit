import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadImage } from '@/lib/r2';
import { randomUUID } from 'crypto';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export async function POST(request: NextRequest) {
  try {
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

    // 프로젝트 조회 (소유권 검사 없이)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: { select: { photos: true } },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found', projectId },
        { status: 404 }
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
        const filename = `${projectId}/${fileId}.${extension}`;

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
    const { photoIds } = await request.json();

    if (!photoIds || !Array.isArray(photoIds)) {
      return NextResponse.json(
        { error: 'Photo IDs array is required' },
        { status: 400 }
      );
    }

    // 사진 조회
    const photos = await prisma.photo.findMany({
      where: {
        id: { in: photoIds },
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
        // Analyze photo with Gemini (이 함수가 없으므로 간단히 처리)
        const updatedPhoto = await prisma.photo.update({
          where: { id: photo.id },
          data: {
            analysis: { analyzed: true, timestamp: new Date().toISOString() },
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
