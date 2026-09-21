import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileImage,
  Sparkles,
  Loader2
} from 'lucide-react';
import { 
  validateImageFile, 
  formatFileSize, 
  uploadPhoto, 
  StorageBucket,
  ALLOWED_IMAGE_TYPES
} from '../../utils/storage';

interface PhotoUploadProps {
  label: string;
  bucket?: StorageBucket;
  currentImageUrl?: string;
  onImageSelected: (file: File | null, previewUrl: string) => void;
  onUploadComplete?: (url: string) => void;
  aspectRatio?: 'square' | 'video' | 'auto';
  helperText?: string;
  required?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  label = 'Product Photo',
  bucket = 'product-images',
  currentImageUrl = '',
  onImageSelected,
  onUploadComplete,
  aspectRatio = 'square',
  helperText = 'JPG, PNG, WEBP • Max 5 MB',
  required = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [fileDetails, setFileDetails] = useState<{ name: string; size: number } | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync with currentImageUrl when editing an existing product/photo
  useEffect(() => {
    if (currentImageUrl && !selectedFile) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl, selectedFile]);

  const handleFileProcess = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate type & size
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid photo file.');
      return;
    }

    setSelectedFile(file);
    setFileDetails({
      name: file.name,
      size: file.size
    });

    // Create instant local object URL for snappy preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onImageSelected(file, objectUrl);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileProcess(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileProcess(files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl('');
    setFileDetails(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    onImageSelected(null, '');
  };

  const triggerGalleryPicker = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    cameraInputRef.current?.click();
  };

  const aspectClass = aspectRatio === 'video' ? 'aspect-[16/10]' : 'aspect-square sm:aspect-[4/3]';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-neutral-800 tracking-wide">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {fileDetails && (
          <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            {formatFileSize(fileDetails.size)}
          </span>
        )}
      </div>

      {/* Hidden standard file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />
      
      {/* Hidden camera capture input for mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload Zone / Preview Card */}
      {previewUrl ? (
        <div className="relative rounded-2xl border-2 border-emerald-500/40 bg-neutral-900/5 p-3 overflow-hidden group">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Image Preview Thumbnail */}
            <div className={`relative w-full sm:w-36 h-36 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0`}>
              <img
                src={previewUrl}
                alt="Selected preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-neutral-900/75 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Ready</span>
              </div>
            </div>

            {/* File Info & Action Controls */}
            <div className="flex-1 w-full flex flex-col justify-between py-1 space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 truncate">
                  <FileImage className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{fileDetails?.name || 'Current Image'}</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {fileDetails 
                    ? `Optimized photo (${formatFileSize(fileDetails.size)})` 
                    : 'Photo linked and active on website'}
                </p>
              </div>

              {/* Progress bar if uploading */}
              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                    <span>Uploading photo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={triggerGalleryPicker}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold border border-neutral-200 shadow-2xs active:scale-[0.98] transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Change Photo</span>
                </button>

                <button
                  type="button"
                  onClick={triggerCameraPicker}
                  className="inline-flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold border border-neutral-200 shadow-2xs active:scale-[0.98] transition-all"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Take Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemove}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200/80 active:scale-[0.98] transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone Upload Area */
        <div
          onClick={triggerGalleryPicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging 
              ? 'border-emerald-600 bg-emerald-50/50 scale-[1.01]' 
              : 'border-neutral-300 hover:border-emerald-500 bg-neutral-50/60 hover:bg-emerald-50/20'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shadow-xs">
              <Camera className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs font-bold text-neutral-900">
                Upload {label}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Click or drag & drop from computer or phone gallery
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[10px] font-medium text-neutral-500 bg-neutral-200/70 px-2.5 py-0.5 rounded-md">
                {helperText}
              </span>
              
              <button
                type="button"
                onClick={triggerCameraPicker}
                className="inline-flex sm:hidden items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md"
              >
                <Camera className="w-3 h-3" />
                <span>Camera</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};
