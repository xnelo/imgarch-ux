import { GroupItemType, StorageType } from "@/filearch_api/FilearchAPI";

export interface FileItem {
  id: number;
  ownerId: number;
  folderId: number;
  storageType: StorageType;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  // Group Info
  item_type: GroupItemType | null;
  folder_in: string | null;
  folder_in_id: number | null;
}