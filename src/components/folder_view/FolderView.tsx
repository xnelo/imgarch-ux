'use client'

import { FilearchFolder, GetAllFolders } from "@/filearch_api/folder";
import useSession from "@/hooks/useSession";
import { use, useState } from "react";
import { FolderItem } from "./FolderItem";
import FolderItemView from "./FolderItemView";

export default function FolderView({folders}:{folders: Promise<FilearchFolder[] | null>}) {
    const allFolders = use(folders);
    if (allFolders === null) {
        return (
            <div>ERROR LOADING FOLDERS!</div>
        );
    }

    let allFolderItems: Map<number, FolderItem> = new Map();
    let rootFolder: FolderItem = {id:0, name:"", parentId:0, children:[]};
    for (const folder of allFolders) {
        const folderItem: FolderItem = {id: folder.id, name: folder.folder_name, parentId: folder.parent_id, children: []};
        allFolderItems.set(folderItem.id, folderItem);
    }

    for (const folderItem of allFolderItems.values()) {
        if (folderItem.parentId === null) {
            rootFolder = folderItem;
            rootFolder.name = "(root)";
            continue;
        }

        allFolderItems.get(folderItem.parentId)?.children.push(folderItem);
    }

    let [selectedFolder, setSelectedFolder] = useState(-1);

    function selectFolderEvent(selectedFolderId: number) {
        if (selectedFolderId === selectedFolder) {
            setSelectedFolder(-1);
        } else {
            setSelectedFolder(selectedFolderId);
        }
    }

    return (
        <FolderItemView data={rootFolder} selectFolderFunc={selectFolderEvent} selectedFolderState={selectedFolder} />
    );
}

;