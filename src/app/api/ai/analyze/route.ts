import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzePhotosBatch } from '@/services/photoAnalysis';
import { themes } from '@/data/themes';

/**
 * POST /api/ai/analyze
 * Analyze photos with Gemini AI
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, photoIds } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        photos: photoIds
          ? {
              where: { id: { in: photoIds } },
              orderBy: { order: 'asc' },
            }
          : {
              orderBy: { order: 'asc' },
            },
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
        { error: 'No photos to analyze' },
        { status: 400 }
      );
    }

    // Get theme
    const theme = themes.find((t) => t.id === project.themeId) || themes[0];

    // Prepare photos for analysis
    const photosForAnalysis = project.photos.map((p) => ({
      id: p.id,
      url: p.originalUrl,
      thumbnailUrl: p.thumbnailUrl,
      order: p.order,
    }));

    // Analyze photos
    const analyses = await analyzePhotosBatch(photosForAnalysis as any, theme);

    // Update photos with analysis results
    const updatePromises = project.photos.map((photo, index) =>
      prisma.photo.update({
        where: { id: photo.id },
        data: {
          aiAnalysis: analyses[index] || null,
        },
      })
    );

    await Promise.all(updatePromises);

    // Fetch updated photos
    const updatedPhotos = await prisma.photo.findMany({
      where: {
        projectId,
        id: { in: project.photos.map((p) => p.id) },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      photos: updatedPhotos,
      analyzedCount: analyses.filter(Boolean).length,
    });
  } catch (error) {
    console.error('Error analyzing photos:', error);
    return NextResponse.json(
      { error: 'Failed to analyze photos' },
      { status: 500 }
    );
  }
}
