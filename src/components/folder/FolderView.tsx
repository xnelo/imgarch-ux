'use client'

import { FilearchFolder } from "@/filearch_api/folder";
import { Suspense, use, useState } from "react";
import { FolderItem } from "./FolderItem";
import FolderContentView from "./content/FolderContentView";
import FolderTreeItemView from "./tree/FolderTreeItemView";
import AddFolder from "./tree/action_buttons/AddFolder";
import RenameFolder from "./tree/action_buttons/RenameFolder";
import DeleteFolder from "./tree/action_buttons/DeleteFolder";
import MoveFolder from "./tree/action_buttons/MoveFolder";

export const NO_FOLDER_SELECTED : number = -1;

function updateFolderName(root: FolderItem, folderId:number, newName:string) {
    const newRoot: FolderItem = {
        id: root.id, 
        name: root.id == folderId ? newName : root.name, 
        parentId: root.parentId, 
        children: []};

    for (const child of root.children) {    
        newRoot.children.push(updateFolderName(child, folderId, newName));
    }

    return newRoot;
}

function addFolderItemToTree(root: FolderItem, toAdd: FolderItem) : FolderItem {
    const newRoot:FolderItem = {id: root.id, name: root.name, parentId: root.parentId, children: []};
    
    if (root.id == toAdd.parentId) {
        newRoot.children.push(toAdd);
    }

    for (const child of root.children) {    
        newRoot.children.push(addFolderItemToTree(child, toAdd));
    }

    return newRoot;
}

function buildInitialTree(allFolders:FilearchFolder[]) : FolderItem | undefined{
    let allFolderItems: Map<number, FolderItem> = new Map();
    let rootFolderId = -1;
    for (const folder of allFolders) {
        const folderItem: FolderItem = {id: folder.id, name: folder.folder_name, parentId: folder.parent_id, children: []};
        allFolderItems.set(folderItem.id, folderItem);
    }

    for (const folderItem of allFolderItems.values()) {
        if (folderItem.parentId === null) {
            rootFolderId = folderItem.id;
            folderItem.name = "(root)";
            continue;
        }

        allFolderItems.get(folderItem.parentId)?.children.push(folderItem);
    }

    return allFolderItems.get(rootFolderId);
}

function findItemInTree(root: FolderItem|undefined, idToFind: number) : FolderItem | undefined {
    if (root === undefined){
        return undefined;
    }
    else if (root.id == idToFind) {
        return root;
    } else {
        for(const child of root.children) {
            const res = findItemInTree(child, idToFind);
            if (res !== undefined) {
                return res;
            }
        }
        return undefined;
    }
}

export default function FolderView({folders}:{folders: Promise<FilearchFolder[] | null>}) {
    

    const allFolders = use(folders);
    if (allFolders === null) {
        return (
            <div>ERROR LOADING FOLDERS!</div>
        );
    }

    const tmpRoot = buildInitialTree(allFolders);
    if (tmpRoot === undefined) {
        return (
            <div>ERROR CONSTRUCTING ROOT ITEM OF FOLDER TREE!</div>
        );
    }

    let [rootFolder, setRootFolder] = useState<FolderItem|undefined>(tmpRoot);
    let [selectedFolder, setSelectedFolder] = useState(NO_FOLDER_SELECTED);
    let [selectedFolderItem, setSelectedFolderItem] = useState<FolderItem|undefined>(undefined);

    function selectFolderEvent(selectedFolderId: number) {
        if (selectedFolderId === selectedFolder) {
            setSelectedFolder(NO_FOLDER_SELECTED);
            setSelectedFolderItem(undefined);
        } else {
            setSelectedFolder(selectedFolderId);
            setSelectedFolderItem(findItemInTree(rootFolder, selectedFolderId));
        }
    }

    function addFolderEventComplete(folderToAdd: FilearchFolder) {
        const folderItem: FolderItem = {id: folderToAdd.id, name: folderToAdd.folder_name, parentId: folderToAdd.parent_id, children: []};
        setRootFolder(prevData=>(prevData!==undefined) ? addFolderItemToTree(prevData, folderItem) : undefined);
    }

    function renameFolderEventComplete(toRename: FilearchFolder) {
        setRootFolder(prevData=>(prevData!==undefined) ? updateFolderName(prevData, toRename.id, toRename.folder_name):undefined);
    }

    return (
    <div className='container-fluid'>
        <div className="position-absolute bg-body-tertiary"
            style={{
                width: 'calc(25vw - 2rem)',
                height: 'calc(100vh - 7.75rem)',
                margin: '1rem',
                left: '0px',
                borderRight: 'var(--bs-border-color) 1px solid'
                }}>
            <div className="container">
                <AddFolder selectedFolder={selectedFolder} addFolderEventComplete={addFolderEventComplete}/>
                <RenameFolder selectedFolderId={selectedFolder} selectedFolderData={selectedFolderItem} renameFolderEventComplete={renameFolderEventComplete}/>
                <DeleteFolder selectedFolder={selectedFolder}/>
                <MoveFolder selectedFolder={selectedFolder}/>
            </div>
            <div 
                className='position-absolute overflow-y-scroll overflow-x-scroll' 
                style={{
                    width: 'calc(25vw - 2.05rem)',
                    height: 'calc(100vh - 7.75rem)'
                    }}>
                <Suspense fallback={<div>Loading...</div>}>
                    {(rootFolder === undefined) 
                    ? <div>NO DATA</div>
                    : <FolderTreeItemView data={rootFolder} selectFolderFunc={selectFolderEvent} selectedFolderState={selectedFolder} />}
                </Suspense>
            </div>
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
                <FolderContentView selectedFolderItem={selectedFolderItem}/>
            </Suspense>
        </div>
    </div>);
}