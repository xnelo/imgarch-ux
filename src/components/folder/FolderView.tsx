'use client'

import { FilearchFolder } from "@/filearch_api/folder";
import { Suspense, use, useState } from "react";
import { FolderItem } from "./FolderItem";
import FolderContentView from "./content/FolderContentView";
import FolderTreeItemView from "./tree/FolderTreeItemView";

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
    <div className='container-fluid'>
        <div 
            className='position-absolute overflow-y-scroll overflow-x-scroll bg-body-tertiary' 
            style={{
                width: 'calc(25vw - 2rem)',
                height: 'calc(100vh - 7.75rem)',
                margin: '1rem',
                left: '0px',
                borderRight: 'var(--bs-border-color) 1px solid'
                }}>
            <Suspense fallback={<div>Loading...</div>}>
                <FolderTreeItemView data={rootFolder} selectFolderFunc={selectFolderEvent} selectedFolderState={selectedFolder} />
            </Suspense>
        </div>
        <div 
            className='position-absolute overflow-y-scroll' 
            style={{
                width: 'calc(75vw - 2rem)',
                height: 'calc(100vh - 7.75rem)',
                margin: '1rem',
                left: '25vw'
                }}>
            <Suspense fallback={<div>Loading...</div>}>
                <FolderContentView selectedFolderItem={allFolderItems.get(selectedFolder)}/>
            </Suspense>
        </div>
    </div>);
}