import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface UploadResult {
  url: string;
  thumbnailUrl: string;
  key: string;
  thumbnailKey: string;
  width: number;
  height: number;
  size: number;
}

export async function uploadImageToSupabase(
  file: Buffer,
  fileName: string,
  projectId: string,
  width: number = 0,
  height: number = 0
): Promise<UploadResult> {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';

  const key = `projects/${projectId}/photos/${timestamp}-${randomId}.${extension}`;
  const thumbnailKey = `projects/${projectId}/thumbnails/${timestamp}-${randomId}.${extension}`;

  // Upload original image
  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(key, file, {
      contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
      upsert: true,
    });

  if (uploadError) {
    console.error('Supabase upload error:', uploadError);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('photos')
    .getPublicUrl(key);

  const url = urlData.publicUrl;
  const thumbnailUrl = url; // Same as original for now

  return {
    url,
    thumbnailUrl,
    key,
    thumbnailKey: key,
    width,
    height,
    size: file.length,
  };
}

export async function deleteFromSupabase(key: string): Promise<void> {
  const { error } = await supabase.storage
    .from('photos')
    .remove([key]);

  if (error) {
    console.error('Delete error:', error);
  }
}
