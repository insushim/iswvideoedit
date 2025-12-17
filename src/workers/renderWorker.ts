/**
 * Video Render Worker
 * Processes video rendering jobs using Remotion
 */

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import { prisma } from '@/lib/prisma';
import { uploadToR2 } from '@/lib/r2';
import { RenderJobData, QUEUE_NAMES } from '@/lib/queue';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Resolution configurations
const resolutionConfig = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
};

// Quality configurations
const qualityConfig = {
  draft: { crf: 28, codec: 'h264' as const },
  standard: { crf: 23, codec: 'h264' as const },
  high: { crf: 18, codec: 'h264' as const },
};

async function processRenderJob(job: Job<RenderJobData>) {
  const { jobId, projectId, userId, settings, compositionData } = job.data;

  console.log(`Starting render job ${jobId} for project ${projectId}`);

  try {
    // Update job status
    await updateRenderJobStatus(jobId, 'processing', 0);
    await job.updateProgress(0);

    // Bundle the Remotion project
    console.log('Bundling Remotion project...');
    const bundleLocation = await bundle({
      entryPoint: path.resolve('./src/remotion/index.ts'),
      webpackOverride: (config) => config,
    });
    await job.updateProgress(10);
    await updateRenderJobStatus(jobId, 'processing', 10);

    // Get composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'PhotoStory',
      inputProps: compositionData,
    });

    // Adjust dimensions based on aspect ratio
    let { width, height } = resolutionConfig[settings.resolution];
    if (settings.aspectRatio === '9:16') {
      [width, height] = [height, width];
    } else if (settings.aspectRatio === '1:1') {
      height = width;
    } else if (settings.aspectRatio === '4:3') {
      height = Math.round(width * 0.75);
    }

    // Create temp output path
    const outputDir = path.resolve('./temp/renders');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, `${jobId}.${settings.format}`);

    // Render the video
    console.log('Rendering video...');
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: settings.format === 'webm' ? 'vp8' : 'h264',
      outputLocation: outputPath,
      inputProps: compositionData,
      imageFormat: 'jpeg',
      pixelFormat: 'yuv420p',
      crf: qualityConfig[settings.quality].crf,
      onProgress: async ({ progress }) => {
        const percent = Math.round(10 + progress * 80);
        await job.updateProgress(percent);
        await updateRenderJobStatus(jobId, 'processing', percent);
      },
    });

    await job.updateProgress(90);
    await updateRenderJobStatus(jobId, 'processing', 90);

    // Upload to R2
    console.log('Uploading to storage...');
    const fileBuffer = fs.readFileSync(outputPath);
    const remoteFilename = `${userId}/${projectId}/output/${jobId}.${settings.format}`;
    const { url: outputUrl } = await uploadToR2(
      fileBuffer,
      remoteFilename,
      `video/${settings.format}`
    );

    // Clean up temp file
    fs.unlinkSync(outputPath);

    await job.updateProgress(100);

    // Update database
    await prisma.renderJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        progress: 100,
        outputUrl,
        completedAt: new Date(),
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'completed',
        exportUrl: outputUrl,
        exportedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`Render job ${jobId} completed successfully`);
    return { success: true, outputUrl };
  } catch (error) {
    console.error(`Render job ${jobId} failed:`, error);

    await prisma.renderJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'failed',
        updatedAt: new Date(),
      },
    });

    throw error;
  }
}

async function updateRenderJobStatus(
  jobId: string,
  status: string,
  progress: number
) {
  try {
    // Call internal API to update status
    const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000';
    await fetch(`${apiUrl}/api/render/${jobId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.INTERNAL_API_KEY || '',
      },
      body: JSON.stringify({ status, progress }),
    });
  } catch (error) {
    console.error('Failed to update job status:', error);
  }
}

// Create worker
export const renderWorker = new Worker<RenderJobData>(
  QUEUE_NAMES.RENDER,
  processRenderJob,
  {
    connection,
    concurrency: parseInt(process.env.RENDER_CONCURRENCY || '1'),
    limiter: {
      max: 10,
      duration: 60000, // 10 jobs per minute max
    },
  }
);

// Worker event handlers
renderWorker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

renderWorker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed with error:`, error.message);
});

renderWorker.on('progress', (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`);
});

renderWorker.on('error', (error) => {
  console.error('Worker error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down render worker...');
  await renderWorker.close();
  process.exit(0);
});

export default renderWorker;
