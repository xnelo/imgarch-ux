'use client'

import { FilearchFolder } from "@/filearch_api/folder";
import { Suspense, use, useState } from "react";
import { FolderItem, FolderItemImpl } from "./FolderItem";
import FolderContentView from "./content/FolderContentView";
import FolderTreeItemView from "./tree/FolderTreeItemView";
import AddFolder from "./tree/action_buttons/AddFolder";
import RenameFolder from "./tree/action_buttons/RenameFolder";
import DeleteFolder from "./tree/action_buttons/DeleteFolder";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';

export const NO_FOLDER_SELECTED : number = -1;

function updateFolderName(root: FolderItem, folderId:number, newName:string) {
    const newRoot: FolderItem = new FolderItemImpl(root.id, root.id == folderId ? newName : root.name, root.parentId);

    for (const child of root.children) {    
        newRoot.children.push(updateFolderName(child, folderId, newName));
    }

    return newRoot;
}

function addFolderItemToTree(root: FolderItem, toAdd: FolderItem) : FolderItem {
    const newRoot:FolderItem = new FolderItemImpl(root.id, root.name, root.parentId);
    
    if (root.id == toAdd.parentId) {
        newRoot.children.push(toAdd);
    }

    for (const child of root.children) {    
        newRoot.children.push(addFolderItemToTree(child, toAdd));
    }

    return newRoot;
}

function removeFolderItemFromTree(root: FolderItem, idToDelete: number) : FolderItem {
    const newRoot:FolderItem = new FolderItemImpl(root.id, root.name, root.parentId);

    for(const child of root.children) {
        if (child.id === idToDelete){
            continue;
        } else {
            newRoot.children.push(removeFolderItemFromTree(child, idToDelete));
        }
    }

    return newRoot;
}

function buildInitialTree(allFolders:FilearchFolder[]) : FolderItem | undefined{
    let allFolderItems: Map<number, FolderItem> = new Map();
    let rootFolderId = -1;
    for (const folder of allFolders) {
        const folderItem: FolderItem = new FolderItemImpl(folder.id, folder.folder_name, folder.parent_id);
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
        const folderItem: FolderItem = new FolderItemImpl(folderToAdd.id, folderToAdd.folder_name, folderToAdd.parent_id);
        setRootFolder(prevData=>(prevData!==undefined) ? addFolderItemToTree(prevData, folderItem) : undefined);
    }

    function renameFolderEventComplete(toRename: FilearchFolder) {
        setRootFolder(prevData=>(prevData!==undefined) ? updateFolderName(prevData, toRename.id, toRename.folder_name):undefined);
    }

    function deleteFolderEventComplete(deletedId: number) {
        setRootFolder(prevData=>(prevData!==undefined) ? removeFolderItemFromTree(prevData, deletedId): undefined);
    }

    function moveFolderEventComplete(idToMove: number, idNewParent: number, idOldParent: number) {
      if (rootFolder === undefined) {
        setRootFolder(undefined);
        return;
      }

      const folderToMove = findItemInTree(rootFolder, idToMove);
      if (folderToMove === undefined) {
        return;
      }

      folderToMove.parentId = idNewParent;
      
      setRootFolder(
        addFolderItemToTree(
          removeFolderItemFromTree(rootFolder, idToMove), 
          folderToMove));
    }

    return (
        <DndProvider backend={HTML5Backend}>
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
                <DeleteFolder selectedFolder={selectedFolder} selectedFolderData={selectedFolderItem} deleteFolderEventComplete={deleteFolderEventComplete}/>
            </div>
            <div 
                className='position-absolute overflow-y-scroll overflow-x-scroll' 
                style={{
                    width: 'calc(25vw - 2.05rem)',
                    height: 'calc(100vh - 8.75rem)'
                    }}>
                <Suspense fallback={<div>Loading...</div>}>
                    {(rootFolder === undefined) 
                    ? <div>NO DATA</div>
                    : <FolderTreeItemView data={rootFolder} selectFolderFunc={selectFolderEvent} selectedFolderState={selectedFolder} moveFolderEventComplete={moveFolderEventComplete}/>}
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
    </div>
    </DndProvider>
    );
}