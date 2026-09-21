import { createClient } from '@supabase/supabase-js';

// Configuration from environment variables
const ENV_SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const ENV_SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  let customUrl = '';
  let customKey = '';
  try {
    if (typeof window !== 'undefined') {
      // Clean up any non-cartg custom keys generically
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.endsWith('_custom_supabase_url') && k !== 'cartg_custom_supabase_url') {
          if (!localStorage.getItem('cartg_custom_supabase_url')) {
            localStorage.setItem('cartg_custom_supabase_url', localStorage.getItem(k) || '');
          }
          localStorage.removeItem(k);
        }
        if (k && k.endsWith('_custom_supabase_key') && k !== 'cartg_custom_supabase_key') {
          if (!localStorage.getItem('cartg_custom_supabase_key')) {
            localStorage.setItem('cartg_custom_supabase_key', localStorage.getItem(k) || '');
          }
          localStorage.removeItem(k);
        }
      }
      customUrl = (localStorage.getItem('cartg_custom_supabase_url') || '').trim();
      customKey = (localStorage.getItem('cartg_custom_supabase_key') || '').trim();
    }
  } catch {}

  const url = customUrl || ENV_SUPABASE_URL;
  const anonKey = customKey || ENV_SUPABASE_ANON_KEY;

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('http') &&
    !url.includes('your-project.supabase.co') &&
    !anonKey.includes('your-anon-public-key')
  );

  return { url, anonKey, isConfigured };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig().isConfigured;
}

export type StorageBucket = 'product-images' | 'store-photos';

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  file?: File;
}

export interface OptimizedImageResult {
  blob: Blob;
  dataUrl: string;
  name: string;
  size: number;
  width: number;
  height: number;
}

export interface UploadResult {
  url: string;
  name: string;
  size: number;
  bucket: StorageBucket;
  type: string;
}

// Allowed MIME types and extensions
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validate selected image file for type and maximum 5MB size
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Check file type
  const isTypeValid = ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase()) ||
    /\.(jpe?g|png|webp)$/i.test(file.name);

  if (!isTypeValid) {
    return { 
      valid: false, 
      error: 'Invalid file format. Please upload a JPG, PNG, or WEBP photo.' 
    };
  }

  // Check file size (max 5 MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return { 
      valid: false, 
      error: `File is too large (${sizeInMb} MB). Maximum allowed size is 5 MB.` 
    };
  }

  return { valid: true, file };
}

/**
 * Format bytes to readable size (KB/MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Client-side image optimization and compression using HTML5 Canvas.
 * Resizes 4K/high-res phone photos to a web-optimized max 1400px while preserving crisp detail.
 */
export async function optimizeImage(
  file: File, 
  maxDimension = 1400, 
  quality = 0.88
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onerror = () => reject(new Error('Failed to read photo file.'));
    
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data.'));
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale proportionally if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not initialize canvas context.'));
          return;
        }

        // Enable high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP or fallback to JPEG
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/webp';
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to blob conversion failed.'));
              return;
            }

            const dataUrl = canvas.toDataURL(outputMime, quality);
            
            // Clean file name
            const cleanBaseName = file.name
              .replace(/\.[^/.]+$/, '')
              .replace(/[^a-zA-Z0-9_-]/g, '_')
              .toLowerCase();
            
            const ext = outputMime === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg');
            const newName = `${cleanBaseName}.${ext}`;

            resolve({
              blob,
              dataUrl,
              name: newName,
              size: blob.size,
              width,
              height
            });
          },
          outputMime,
          quality
        );
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

// Lazy Supabase client initialization
let supabaseClient: ReturnType<typeof createClient> | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseClient() {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return null;
  }

  if (!supabaseClient || cachedUrl !== url || cachedKey !== anonKey) {
    try {
      supabaseClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      cachedUrl = url;
      cachedKey = anonKey;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      supabaseClient = null;
    }
  }
  return supabaseClient;
}

/**
 * Upload a photo directly to Supabase Storage bucket ("product-images" or "store-photos").
 * Gracefully falls back to high-quality persistent DataURL if Supabase credentials are not configured.
 */
export async function uploadPhoto(
  file: File,
  bucket: StorageBucket = 'product-images',
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  // Step 1: Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid file.');
  }

  if (onProgress) onProgress(15);

  // Step 2: Optimize and compress
  const optimized = await optimizeImage(file);
  
  if (onProgress) onProgress(45);

  const supabase = getSupabaseClient();
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const fileName = `${timestamp}_${randomSuffix}_${optimized.name}`;

  // Step 3: If Supabase Storage is configured, upload to bucket
  if (supabase) {
    try {
      if (onProgress) onProgress(60);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, optimized.blob, {
          contentType: optimized.blob.type,
          upsert: true,
          cacheControl: '31536000'
        });

      if (error) {
        console.warn(`Supabase bucket "${bucket}" upload returned error, checking bucket:`, error);
        // If bucket doesn't exist, we fallback to optimized dataUrl so upload never fails the user
      } else if (data?.path) {
        // Retrieve public URL from Supabase Storage
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        if (publicUrlData?.publicUrl) {
          if (onProgress) onProgress(100);
          return {
            url: publicUrlData.publicUrl,
            name: file.name,
            size: optimized.size,
            bucket,
            type: optimized.blob.type
          };
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, falling back to permanent data URL:', err);
    }
  }

  // Step 4: Robust fallback - return permanent optimized data URL
  if (onProgress) onProgress(100);
  
  return {
    url: optimized.dataUrl,
    name: file.name,
    size: optimized.size,
    bucket,
    type: optimized.blob.type
  };
}
