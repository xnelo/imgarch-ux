export interface FolderItem {
    id: number;
    name: string;
    parentId: number;
    children: FolderItem[];
    /**
     * Check if the passed in item is a descendant of this FolderItem
     * @param item The FolderItem to check.
     * @returns A boolean, true if the passed in item is a descendant 
     *          of this FolderItem false if it is not.
     */
    isDescendant(item:FolderItem):boolean;
}

export class FolderItemImpl implements FolderItem {
    id: number;
    name: string;
    parentId: number;
    children: FolderItem[];

    constructor(id:number, name:string, parentId:number) {
        this.id = id;
        this.name = name;
        this.parentId = parentId;
        this.children = [];
    }
    
    isDescendant(item: FolderItem): boolean {
        if (this.children.length <= 0) {
            return false;
        }

        for (const child of this.children) {
            if (item.id === child.id || child.isDescendant(item)) {
                return true;
            } 
        }
        return false;
    }
}