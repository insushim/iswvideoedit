import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSignedUploadUrl } from '@/lib/r2';
import { v4 as uuidv4 } from 'uuid';

interface PresignRequest {
  projectId: string;
  files: Array<{
    name: string;
    type: string;
    size: number;
  }>;
}

interface PresignedFile {
  id: string;
  originalName: string;
  key: string;
  thumbnailKey: string;
  uploadUrl: string;
  thumbnailUploadUrl: string;
  publicUrl: string;
  thumbnailPublicUrl: string;
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

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export async function POST(request: NextRequest) {
  try {
    const body: PresignRequest = await request.json();
    const { projectId, files } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 프로젝트 확인
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    const PUBLIC_URL = process.env.R2_PUBLIC_URL!;
    const presignedFiles: PresignedFile[] = [];
    const errors: Array<{ name: string; error: string }> = [];

    for (const file of files) {
      // 파일 유효성 검사
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push({
          name: file.name,
          error: 'Invalid file type. Allowed: JPEG, PNG, WebP, HEIC',
        });
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push({
          name: file.name,
          error: 'File too large. Maximum size: 20MB',
        });
        continue;
      }

      const id = uuidv4();
      const key = `projects/${projectId}/photos/${id}.webp`;
      const thumbnailKey = `projects/${projectId}/thumbnails/${id}.webp`;

      // Presigned URL 생성 (원본과 썸네일 모두)
      const [uploadUrl, thumbnailUploadUrl] = await Promise.all([
        getSignedUploadUrl(key, 'image/webp', 3600),
        getSignedUploadUrl(thumbnailKey, 'image/webp', 3600),
      ]);

      presignedFiles.push({
        id,
        originalName: file.name,
        key,
        thumbnailKey,
        uploadUrl,
        thumbnailUploadUrl,
        publicUrl: `${PUBLIC_URL}/${key}`,
        thumbnailPublicUrl: `${PUBLIC_URL}/${thumbnailKey}`,
      });
    }

    return NextResponse.json(
      {
        files: presignedFiles,
        errors: errors.length > 0 ? errors : undefined,
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error generating presigned URLs:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URLs' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
