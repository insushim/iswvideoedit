/**
 * 클라이언트 사이드 이미지 처리 유틸리티
 * 브라우저에서 이미지를 WebP로 변환하고 썸네일을 생성
 */

export interface ProcessedImage {
  originalBlob: Blob;
  thumbnailBlob: Blob;
  width: number;
  height: number;
}

/**
 * 이미지를 로드하여 HTMLImageElement로 반환
 */
async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Canvas를 사용하여 이미지를 WebP로 변환
 */
async function canvasToWebP(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      'image/webp',
      quality
    );
  });
}

/**
 * 이미지 파일을 처리하여 WebP 원본과 썸네일 생성
 */
export async function processImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    thumbnailSize?: number;
    thumbnailQuality?: number;
  } = {}
): Promise<ProcessedImage> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.85,
    thumbnailSize = 400,
    thumbnailQuality = 0.75,
  } = options;

  const img = await loadImage(file);
  const originalWidth = img.naturalWidth;
  const originalHeight = img.naturalHeight;

  // 원본 이미지 처리 (최대 크기 제한)
  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // 원본 캔버스 생성
  const originalCanvas = document.createElement('canvas');
  originalCanvas.width = width;
  originalCanvas.height = height;
  const originalCtx = originalCanvas.getContext('2d');
  if (!originalCtx) throw new Error('Failed to get canvas context');
  originalCtx.drawImage(img, 0, 0, width, height);

  // 썸네일 캔버스 생성 (정사각형 crop)
  const thumbnailCanvas = document.createElement('canvas');
  thumbnailCanvas.width = thumbnailSize;
  thumbnailCanvas.height = thumbnailSize;
  const thumbCtx = thumbnailCanvas.getContext('2d');
  if (!thumbCtx) throw new Error('Failed to get canvas context');

  // 중앙 기준 crop
  const cropSize = Math.min(originalWidth, originalHeight);
  const cropX = (originalWidth - cropSize) / 2;
  const cropY = (originalHeight - cropSize) / 2;
  thumbCtx.drawImage(
    img,
    cropX,
    cropY,
    cropSize,
    cropSize,
    0,
    0,
    thumbnailSize,
    thumbnailSize
  );

  // WebP로 변환
  const [originalBlob, thumbnailBlob] = await Promise.all([
    canvasToWebP(originalCanvas, quality),
    canvasToWebP(thumbnailCanvas, thumbnailQuality),
  ]);

  // 메모리 정리
  URL.revokeObjectURL(img.src);

  return {
    originalBlob,
    thumbnailBlob,
    width,
    height,
  };
}

/**
 * Blob을 R2/S3에 직접 업로드
 */
export async function uploadToPresignedUrl(
  presignedUrl: string,
  blob: Blob,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress((e.loaded / e.total) * 100);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', 'image/webp');
    xhr.send(blob);
  });
}
