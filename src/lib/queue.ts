/**
 * BullMQ Queue Configuration
 * For background video rendering jobs
 */

import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

// Redis connection
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Queue names
export const QUEUE_NAMES = {
  RENDER: 'video-render',
  ANALYZE: 'photo-analyze',
  TTS: 'tts-generate',
} as const;

// Render job data interface
export interface RenderJobData {
  jobId: string;
  projectId: string;
  userId: string;
  settings: {
    resolution: '720p' | '1080p' | '4k';
    format: 'mp4' | 'webm' | 'mov';
    quality: 'draft' | 'standard' | 'high';
    aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
    fps: number;
  };
  compositionData: {
    durationInFrames: number;
    clips: any[];
    audio: any;
    introConfig: any;
    outroConfig: any;
  };
}

// Create render queue
export const renderQueue = new Queue<RenderJobData>(QUEUE_NAMES.RENDER, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// Queue events for real-time updates
export const renderQueueEvents = new QueueEvents(QUEUE_NAMES.RENDER, {
  connection,
});

// Add job to render queue
export async function addRenderJob(data: RenderJobData, priority: number = 1) {
  const job = await renderQueue.add('render', data, {
    priority,
    jobId: data.jobId,
  });
  return job;
}

// Get job by ID
export async function getRenderJob(jobId: string) {
  return await renderQueue.getJob(jobId);
}

// Get job status
export async function getRenderJobStatus(jobId: string) {
  const job = await renderQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  const progress = job.progress as number;

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    failedReason: job.failedReason,
    finishedOn: job.finishedOn,
    processedOn: job.processedOn,
  };
}

// Cancel job
export async function cancelRenderJob(jobId: string) {
  const job = await renderQueue.getJob(jobId);
  if (job) {
    await job.remove();
    return true;
  }
  return false;
}

// Get queue statistics
export async function getQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    renderQueue.getWaitingCount(),
    renderQueue.getActiveCount(),
    renderQueue.getCompletedCount(),
    renderQueue.getFailedCount(),
    renderQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

// Clean old jobs
export async function cleanOldJobs() {
  await renderQueue.clean(24 * 3600 * 1000, 1000, 'completed'); // 24 hours
  await renderQueue.clean(7 * 24 * 3600 * 1000, 1000, 'failed'); // 7 days
}

export { connection, Queue, Worker, Job };
