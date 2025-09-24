import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export const useConvexImageUrl = (storageId: Id<"_storage"> | undefined) => {
  return useQuery(
    api.files.getFileUrl,
    storageId ? { storageId } : "skip"
  );
};

export const useConvexImageUrls = (storageIds: Id<"_storage">[]) => {
  return useQuery(
    api.files.getFileUrls,
    storageIds.length > 0 ? { storageIds } : "skip"
  );
};
