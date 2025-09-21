'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useMoralisUpload } from '@/hooks/useMoralisUpload';
import { Button } from './button';
import { Loader2, Upload as UploadIcon, X } from 'lucide-react';

interface MoralisFileUploaderProps {
  label?: string;
  onUploadSuccess: (fileInfo: { 
    url: string; 
    hash: string;
    name: string;
    type: string;
    size: number;
  }) => void;
  onRemove?: () => void;
  value?: string | null;
  className?: string;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
}

export function MoralisFileUploader({
  label,
  onUploadSuccess,
  onRemove,
  value,
  className = '',
  multiple = false,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
}: MoralisFileUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadFile, isUploading } = useMoralisUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Check file size
      if (file.size > maxSize) {
        throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      }

      // Set preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }

      // Upload to Moralis
      const result = await uploadFile(file, {
        onSuccess: (fileInfo) => {
          onUploadSuccess(fileInfo);
        },
        onError: (error) => {
          console.error('Upload error:', error);
          // Handle error (e.g., show toast)
        },
      });

    } catch (error) {
      console.error('Error handling file upload:', error);
      // Handle error (e.g., show toast)
    } finally {
      // Reset file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (onRemove) onRemove();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Create a fake event to reuse the handleFileChange function
      const fakeEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="relative group">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-h-48 mx-auto rounded-md"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <UploadIcon className="h-10 w-10 text-gray-400" />
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">Drag and drop files here, or click to select</p>
              <p className="text-xs text-gray-500 mt-1">
                {accept.includes('image/') ? 'Images' : 'Files'} up to {maxSize / (1024 * 1024)}MB
              </p>
            </div>
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="relative"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Select Files'
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept={accept}
                multiple={multiple}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
