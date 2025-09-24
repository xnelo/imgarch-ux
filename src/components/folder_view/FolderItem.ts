export interface FolderItem {
    id: number;
    name: string;
    parentId: number;
    children: FolderItem[];
}