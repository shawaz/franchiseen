import { useState } from 'react';
import { useMoralis } from 'react-moralis';

type UploadableFile = File | { name: string; type?: string; size: number; data?: any };

export const useMoralisUpload = () => {
  const { Moralis } = useMoralis();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (file: UploadableFile, options: { 
    metadata?: Record<string, any>;
    onSuccess?: (file: any) => void;
    onError?: (error: Error) => void;
  } = {}) => {
    setIsUploading(true);
    setError(null);

    try {
      // Handle different file types appropriately
      let fileData: any;
      if (file instanceof File) {
        fileData = file;
      } else if ('data' in file && file.data) {
        fileData = file.data;
      } else {
        // For other objects, use the object itself but ensure it has required fields
        fileData = {
          name: file.name,
          type: 'type' in file ? file.type : 'application/octet-stream',
          size: file.size
        };
      }
      
      const moralisFile = new Moralis.File(file.name, fileData);
      await moralisFile.saveIPFS();
      
      const result = {
        url: moralisFile.ipfs(),
        hash: moralisFile.hash,
        name: moralisFile.name(),
        type: moralisFile.type() || (file && 'type' in file && file.type) || 'application/octet-stream',
        size: moralisFile.size(),
        metadata: options.metadata || {}
      };

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (options.onError) {
        options.onError(error);
      }
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, error };
};
