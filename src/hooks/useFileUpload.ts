import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useFileUpload() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFileUrl = useMutation(api.files.saveFileUrl);

  const uploadFile = async (file: File): Promise<Id<"_storage">> => {
    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload file to Convex storage
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const { storageId } = await response.json();
      
      // Save file metadata
      await saveFileUrl({
        storageId,
        fileName: file.name,
        fileType: file.type,
      });
      
      // Return the storage ID (we'll convert to URL when needed)
      return storageId as Id<"_storage">;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  };

  const uploadMultipleFiles = async (files: File[]): Promise<Id<"_storage">[]> => {
    try {
      const uploadPromises = files.map(file => uploadFile(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Multiple file upload error:", error);
      throw error;
    }
  };

  return {
    uploadFile,
    uploadMultipleFiles,
  };
}
