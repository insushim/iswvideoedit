'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button, ProgressBar } from '@/components/common';
import {
  Upload,
  Image,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  GripVertical,
} from 'lucide-react';

interface UploadedPhoto {
  id: string;
  file?: File;
  preview: string;
  status: 'waiting' | 'uploading' | 'analyzing' | 'complete' | 'error';
  progress?: number;
  error?: string;
  serverData?: {
    id: string;
    originalUrl: string;
    thumbnailUrl: string;
  };
}

interface PhotoUploaderProps {
  projectId: string;
  onPhotosUploaded?: (photos: UploadedPhoto[]) => void;
  onProjectCreated?: (projectId: string) => void;
  maxFiles?: number;
  maxSizePerFile?: number;
}

// 이미지를 압축하여 3MB 이하로 만드는 함수
async function compressImage(file: File, maxSizeMB: number = 3): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // 최대 크기 제한 (2048px)
      const maxDim = 2048;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = (height / width) * maxDim;
          width = maxDim;
        } else {
          width = (width / height) * maxDim;
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // 품질을 조정하면서 목표 크기 이하로 압축
      let quality = 0.8;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const sizeMB = blob.size / (1024 * 1024);
            if (sizeMB > maxSizeMB && quality > 0.3) {
              quality -= 0.1;
              tryCompress();
            } else {
              resolve(blob);
            }
          },
          'image/jpeg',
          quality
        );
      };

      tryCompress();
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  projectId: initialProjectId,
  onPhotosUploaded,
  onProjectCreated,
  maxFiles = 100,
  maxSizePerFile = 20 * 1024 * 1024,
}) => {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string>(initialProjectId);

  const ensureProject = async (): Promise<string | null> => {
    if (currentProjectId && currentProjectId !== 'temp') {
      return currentProjectId;
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: '새 프로젝트',
          themeId: 'elegant-fade',
        }),
      });

      if (response.ok) {
        const project = await response.json();
        setCurrentProjectId(project.id);
        onProjectCreated?.(project.id);
        return project.id;
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
    return null;
  };

  // 한 장씩 업로드 (순차 처리로 413 에러 방지)
  const uploadSingleFile = async (
    file: File,
    projectId: string,
    photoId: string
  ): Promise<boolean> => {
    try {
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId ? { ...p, status: 'uploading' as const, progress: 10 } : p
        )
      );

      // 이미지 압축 (3MB 이하로)
      const compressedBlob = await compressImage(file, 3);

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId ? { ...p, progress: 30 } : p
        )
      );

      // FormData로 한 장씩 전송
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('files', compressedBlob, file.name);

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload response error:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.uploaded && result.uploaded.length > 0) {
        const uploadedPhoto = result.uploaded[0];
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photoId
              ? {
                  ...p,
                  status: 'complete' as const,
                  progress: 100,
                  serverData: {
                    id: uploadedPhoto.id,
                    originalUrl: uploadedPhoto.url,
                    thumbnailUrl: uploadedPhoto.thumbnailUrl,
                  },
                }
              : p
          )
        );
        return true;
      } else {
        throw new Error(result.errors?.[0]?.error || 'Unknown error');
      }
    } catch (error) {
      console.error(`Upload error for ${file.name}:`, error);
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId
            ? { ...p, status: 'error' as const, error: '업로드 실패' }
            : p
        )
      );
      return false;
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      rejectedFiles.forEach((file) => {
        console.warn('Rejected file:', file.file.name, file.errors);
      });

      if (photos.length + acceptedFiles.length > maxFiles) {
        alert(`최대 ${maxFiles}장까지 업로드할 수 있습니다.`);
        return;
      }

      const projectId = await ensureProject();
      if (!projectId) {
        alert('프로젝트 생성에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      // 미리보기 생성
      const newPhotos: UploadedPhoto[] = acceptedFiles.map((file) => ({
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        status: 'waiting' as const,
        progress: 0,
      }));

      setPhotos((prev) => [...prev, ...newPhotos]);
      setIsUploading(true);

      // 한 장씩 순차적으로 업로드 (413 에러 방지)
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const photoId = newPhotos[i].id;

        await uploadSingleFile(file, projectId, photoId);

        // 약간의 딜레이 (서버 부하 방지)
        if (i < acceptedFiles.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      setIsUploading(false);
      onPhotosUploaded?.(photos);
    },
    [currentProjectId, photos, maxFiles, onPhotosUploaded]
  );

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo?.preview) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
    },
    maxSize: maxSizePerFile,
    multiple: true,
  });

  const uploadedCount = photos.filter((p) => p.status === 'complete').length;
  const totalCount = photos.length;

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all',
          isDragActive
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-300 hover:border-purple-400 dark:border-gray-700 dark:hover:border-purple-600'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full transition-colors',
              isDragActive
                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
            )}
          >
            <Upload className="h-8 w-8" />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragActive ? '여기에 놓으세요!' : '사진을 드래그하거나 클릭하여 업로드'}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              JPG, PNG, WebP, HEIC · 최대 {Math.round(maxSizePerFile / 1024 / 1024)}MB
            </p>
          </div>

          <Button variant="secondary" size="sm">
            파일 선택
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              사진 업로드 중... ({uploadedCount}/{totalCount})
            </span>
          </div>
          <ProgressBar
            value={(uploadedCount / Math.max(totalCount, 1)) * 100}
            size="sm"
            className="mt-3"
          />
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white">
              업로드된 사진 ({uploadedCount}/{totalCount})
            </h3>
            {photos.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => setPhotos([])}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                전체 삭제
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                {/* Thumbnail */}
                <img
                  src={photo.serverData?.thumbnailUrl || photo.preview}
                  alt={`Photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                {/* Order Badge */}
                <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs font-medium text-white">
                  {index + 1}
                </div>

                {/* Status Overlay */}
                {photo.status !== 'complete' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    {photo.status === 'waiting' && (
                      <div className="text-center text-white">
                        <div className="mx-auto h-6 w-6 rounded-full border-2 border-white/30" />
                        <span className="mt-1 block text-xs">대기 중...</span>
                      </div>
                    )}
                    {photo.status === 'uploading' && (
                      <div className="text-center text-white">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        <span className="mt-1 block text-xs">
                          업로드 중 {Math.round(photo.progress || 0)}%
                        </span>
                      </div>
                    )}
                    {photo.status === 'analyzing' && (
                      <div className="text-center text-white">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        <span className="mt-1 block text-xs">AI 분석 중...</span>
                      </div>
                    )}
                    {photo.status === 'error' && (
                      <div className="text-center text-white">
                        <AlertCircle className="mx-auto h-6 w-6 text-red-400" />
                        <span className="mt-1 block text-xs">{photo.error}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Complete Check */}
                {photo.status === 'complete' && (
                  <div className="absolute right-2 top-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                  <button
                    className="rounded-lg bg-white/90 p-2 text-gray-700 transition hover:bg-white"
                    onClick={() => removePhoto(photo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button className="cursor-grab rounded-lg bg-white/90 p-2 text-gray-700 transition hover:bg-white">
                    <GripVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && !isUploading && (
        <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800/50">
          <Image className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            아직 사진이 없습니다
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            위의 영역을 클릭하거나 사진을 드래그하여 업로드하세요
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
