import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export interface UploadResult {
  url: string;
  thumbnailUrl: string;
  key: string;
  thumbnailKey: string;
  width: number;
  height: number;
  size: number;
}

export async function uploadImage(
  file: Buffer,
  fileName: string,
  projectId: string
): Promise<UploadResult> {
  const id = uuidv4();
  const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const key = `projects/${projectId}/photos/${id}.webp`;
  const thumbnailKey = `projects/${projectId}/thumbnails/${id}.webp`;

  // Process original image
  const image = sharp(file);
  const metadata = await image.metadata();

  // Convert to WebP with quality optimization
  const webpBuffer = await image
    .webp({ quality: 85 })
    .toBuffer();

  // Create thumbnail
  const thumbnailBuffer = await sharp(file)
    .resize(400, 400, { fit: 'cover' })
    .webp({ quality: 75 })
    .toBuffer();

  // Upload original
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: webpBuffer,
      ContentType: 'image/webp',
    })
  );

  // Upload thumbnail
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: thumbnailKey,
      Body: thumbnailBuffer,
      ContentType: 'image/webp',
    })
  );

  return {
    url: `${PUBLIC_URL}/${key}`,
    thumbnailUrl: `${PUBLIC_URL}/${thumbnailKey}`,
    key,
    thumbnailKey,
    width: metadata.width || 0,
    height: metadata.height || 0,
    size: webpBuffer.length,
  };
}

export async function uploadAudio(
  file: Buffer,
  fileName: string,
  projectId: string
): Promise<{ url: string; key: string }> {
  const id = uuidv4();
  const extension = fileName.split('.').pop()?.toLowerCase() || 'mp3';
  const key = `projects/${projectId}/audio/${id}.${extension}`;

  const contentType = extension === 'mp3' ? 'audio/mpeg' : 'audio/wav';

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return {
    url: `${PUBLIC_URL}/${key}`,
    key,
  };
}

export async function uploadVideo(
  file: Buffer,
  fileName: string,
  projectId: string
): Promise<{ url: string; key: string }> {
  const id = uuidv4();
  const extension = fileName.split('.').pop()?.toLowerCase() || 'mp4';
  const key = `projects/${projectId}/exports/${id}.${extension}`;

  const contentType = extension === 'webm' ? 'video/webm' : 'video/mp4';

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return {
    url: `${PUBLIC_URL}/${key}`,
    key,
  };
}

export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

export async function deleteProjectFiles(projectId: string): Promise<void> {
  // Note: In production, you'd want to list and delete all files with the prefix
  // For now, this is a placeholder
  console.log(`Deleting files for project ${projectId}`);
}

export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}
