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

    /**
     * Check if the passed in itemId is a descendant of this FolderItem
     * @param itemId The FolderItem id to check.
     * @returns A boolean, true if the passed in id is a descendant of 
     *          this FolderItem, false if it is not.
     */
    isDescendantId(itemId:number):boolean;
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
        return this.isDescendantId(item.id);
    }

    isDescendantId(itemId:number):boolean {
      if (this.children.length <= 0) {
          return false;
      }

      for (const child of this.children) {
          if (itemId === child.id || child.isDescendantId(itemId)) {
              return true;
          } 
      }
      return false;
    }
}