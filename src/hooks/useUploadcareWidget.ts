import { useEffect, useState } from 'react';

interface UploadcareFile {
  cdnUrl: string;
  uuid: string;
  name: string;
  size: number;
  isImage: boolean;
  mimeType: string;
  originalFileInfo: {
    name: string;
    size: number;
    mimeType: string;
  };
}

interface UploadcareWidget {
  Widget: {
    (element: HTMLElement | null, options?: Record<string, unknown>): {
      openDialog: () => void;
      reloadInfo: () => void;
      // Add other widget methods as needed
    };
  };
  start: () => void;
  registerTab: (tabName: string, callback: () => void) => void;
  tabs: () => string[];
  openDialog: (tabName: string) => void;
  closeDialog: () => void;
  hideDialog: () => void;
  showDialog: () => void;
  isDialogOpen: () => boolean;
  isDialogHidden: () => boolean;
  onDialogOpen: (callback: () => void) => void;
  onDialogClose: (callback: () => void) => void;
  onUploadComplete: (callback: (files: UploadcareFile[]) => void) => void;
  onFileSelect: (callback: (files: UploadcareFile[]) => void) => void;
}

declare global {
  interface Window {
    UPLOADCARE_PUBLIC_KEY: string;
    uploadcare: UploadcareWidget;
  }
}

export const useUploadcareWidget = (publicKey: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if the script is already loaded
    if (window.uploadcare) {
      setIsLoading(false);
      return;
    }

    // Set the public key for Uploadcare
    window.UPLOADCARE_PUBLIC_KEY = publicKey;

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js';
    script.async = true;
    
    script.onload = () => {
      setIsLoading(false);
    };
    
    script.onerror = () => {
      setError(new Error('Failed to load Uploadcare widget'));
      setIsLoading(false);
    };

    // Add script to document
    document.body.appendChild(script);

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [publicKey]);

  return { isLoading, error };
};
