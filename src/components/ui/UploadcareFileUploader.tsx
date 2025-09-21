'use client';

import { FileUploaderRegular } from '@uploadcare/react-uploader';
import '@uploadcare/react-uploader/core.css';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface UploadcareFileUploaderProps {
  label: string;
  onUploadSuccess: (fileInfo: { cdnUrl: string; uuid: string }) => void;
  onRemove?: () => void;
  value?: string | null;
  className?: string;
  multiple?: boolean;
  previewClassName?: string;
}

export function UploadcareFileUploader({
  label,
  onUploadSuccess,
  onRemove,
  value,
  className = '',
  multiple = false,
  previewClassName = ''
}: UploadcareFileUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

  useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  interface FileInfo {
    cdnUrl: string;
    uuid: string;
    name: string;
    size: number;
    isImage: boolean;
    mimeType: string;
  }

  const handleUploadSuccess = (fileInfo: FileInfo) => {
    if (fileInfo) {
      setPreviewUrl(fileInfo.cdnUrl);
      onUploadSuccess({
        cdnUrl: fileInfo.cdnUrl,
        uuid: fileInfo.uuid
      });
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (onRemove) onRemove();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {previewUrl ? (
        <div className={`relative ${previewClassName}`}>
          <Image
            src={previewUrl}
            alt="Preview"
            width={500}
            height={500}
            className="max-w-full h-auto rounded-md border border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            aria-label="Remove image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 flex items-center justify-center">
          <FileUploaderRegular
            pubkey={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || ''}
            onFileUploadSuccess={handleUploadSuccess}
            multiple={multiple}
            sourceList="local, url, camera"
            classNameUploader="w-full"
            imgOnly
            cropPreset="1:1"
          />
        </div>
      )}
    </div>
  );
}
