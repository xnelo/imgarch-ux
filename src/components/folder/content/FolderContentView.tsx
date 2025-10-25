'use client'

import { FolderItem } from "../FolderItem";

export default function FolderContentView({selectedFolderItem}:{selectedFolderItem:FolderItem | undefined}) {

    if (selectedFolderItem === undefined) {
        return (
            <h2>NO FOLDER SELECTED</h2>
        );
    }

    return (
        <h2>Folder: {selectedFolderItem.name}</h2>
    );
}