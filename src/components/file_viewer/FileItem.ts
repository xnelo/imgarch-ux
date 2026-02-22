import { StorageType } from "@/filearch_api/FilearchAPI";

export interface FileItem {
  id: number;
  ownerId: number;
  folderId: number;
  storageType: StorageType;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
}