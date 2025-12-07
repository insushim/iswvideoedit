'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button, ProgressBar } from '@/components/common';
import {
  Upload,
  Image,
  X,
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
  status: 'uploading' | 'analyzing' | 'complete' | 'error';
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
  maxFiles?: number;
  maxSizePerFile?: number; // in bytes
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  projectId,
  onPhotosUploaded,
  maxFiles = 100,
  maxSizePerFile = 20 * 1024 * 1024, // 20MB
}) => {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      rejectedFiles.forEach((file) => {
        console.warn('Rejected file:', file.file.name, file.errors);
      });

      if (photos.length + acceptedFiles.length > maxFiles) {
        alert(`최대 ${maxFiles}장까지 업로드할 수 있습니다.`);
        return;
      }

      // Create preview photos
      const newPhotos: UploadedPhoto[] = acceptedFiles.map((file) => ({
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        status: 'uploading' as const,
        progress: 0,
      }));

      setPhotos((prev) => [...prev, ...newPhotos]);
      setIsUploading(true);

      // Upload files
      try {
        const formData = new FormData();
        formData.append('projectId', projectId);
        acceptedFiles.forEach((file) => {
          formData.append('files', file);
        });

        const response = await fetch('/api/photos/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();

        // Update photos with server data
        setPhotos((prev) =>
          prev.map((photo, index) => {
            const uploadedPhoto = result.uploaded?.find(
              (_: any, i: number) =>
                i === index - (prev.length - acceptedFiles.length)
            );

            if (uploadedPhoto) {
              return {
                ...photo,
                status: 'analyzing' as const,
                progress: 100,
                serverData: {
                  id: uploadedPhoto.id,
                  originalUrl: uploadedPhoto.originalUrl,
                  thumbnailUrl: uploadedPhoto.thumbnailUrl,
                },
              };
            }

            const error = result.errors?.find(
              (e: any) => e.filename === photo.file?.name
            );
            if (error) {
              return {
                ...photo,
                status: 'error' as const,
                error: error.error,
              };
            }

            return photo;
          })
        );

        // Trigger AI analysis
        if (result.uploaded?.length > 0) {
          const photoIds = result.uploaded.map((p: any) => p.id);
          await analyzePhotos(photoIds);
        }

        onPhotosUploaded?.(photos);
      } catch (error) {
        console.error('Upload error:', error);
        setPhotos((prev) =>
          prev.map((photo) =>
            photo.status === 'uploading'
              ? { ...photo, status: 'error' as const, error: '업로드 실패' }
              : photo
          )
        );
      } finally {
        setIsUploading(false);
      }
    },
    [projectId, photos, maxFiles, onPhotosUploaded]
  );

  const analyzePhotos = async (photoIds: string[]) => {
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, photoIds }),
      });

      if (response.ok) {
        setPhotos((prev) =>
          prev.map((photo) =>
            photo.serverData && photoIds.includes(photo.serverData.id)
              ? { ...photo, status: 'complete' as const }
              : photo
          )
        );
      }
    } catch (error) {
      console.error('Analysis error:', error);
    }
  };

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
              사진 업로드 중...
            </span>
          </div>
          <ProgressBar
            value={(uploadedCount / totalCount) * 100}
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
            {uploadedCount > 0 && (
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
                    {photo.status === 'uploading' && (
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
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
