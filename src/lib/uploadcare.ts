import { UploadClient } from '@uploadcare/upload-client';

// Initialize the Uploadcare client
export const uploadcareClient = new UploadClient({
  publicKey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || 'YOUR_UPLOADCARE_PUBLIC_KEY'
});

// Upload a file to Uploadcare
export const uploadFile = async (file: File): Promise<{ cdnUrl: string; uuid: string }> => {
  try {
    const result = await uploadcareClient.uploadFile(file, {
      store: 'auto', // Store the file permanently
    });
    
    return {
      cdnUrl: result.cdnUrl,
      uuid: result.uuid
    };
  } catch (error) {
    console.error('Error uploading file to Uploadcare:', error);
    throw error;
  }
};

// Delete a file from Uploadcare
export const deleteFile = async (uuid: string): Promise<void> => {
  try {
    const response = await fetch(`https://api.uploadcare.com/files/${uuid}/storage/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Uploadcare.Simple ${process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
        'Accept': 'application/vnd.uploadcare-v0.7+json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting file from Uploadcare:', error);
    throw error;
  }
};
