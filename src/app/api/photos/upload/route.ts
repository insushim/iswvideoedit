import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadImageToSupabase } from '@/lib/supabase-storage';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

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
    const formData = await request.formData();
    const projectId = formData.get('projectId') as string;
    const files = formData.getAll('files') as File[];

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: { select: { photos: true } },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found', projectId },
        { status: 404, headers: corsHeaders() }
      );
    }

    const uploadedPhotos = [];
    const errors = [];
    let currentOrder = project._count.photos;

    for (const file of files) {
      try {
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

        const buffer = Buffer.from(await file.arrayBuffer());

        // Supabase Storage로 업로드
        const uploadResult = await uploadImageToSupabase(buffer, file.name, projectId);

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

    await prisma.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      uploaded: uploadedPhotos,
      errors: errors.length > 0 ? errors : undefined,
      total: uploadedPhotos.length,
    }, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error in photo upload:', error);
    return NextResponse.json(
      { error: 'Failed to upload photos' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { photoIds } = await request.json();

    if (!photoIds || !Array.isArray(photoIds)) {
      return NextResponse.json(
        { error: 'Photo IDs array is required' },
        { status: 400 }
      );
    }

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

    const analyzedPhotos = [];

    for (const photo of photos) {
      try {
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
