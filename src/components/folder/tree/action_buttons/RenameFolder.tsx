'use client'
import { MouseEvent, useState } from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ActionButtonBase from "./ActionButtonBase";
import { FolderItem } from "../../FolderItem";
import { FilearchFolder } from "@/filearch_api/folder";
import toast from "react-hot-toast";
import { NO_FOLDER_SELECTED } from "../../FolderView";
import { RenameFolderAction } from "../actions/FolderActions";

export default function RenameFolder({selectedFolderId, selectedFolderData, renameFolderEventComplete}: {selectedFolderId:number, selectedFolderData: FolderItem|undefined, renameFolderEventComplete:(toRename:FilearchFolder)=>void}) {

    const [show, setShow] = useState(false);
    
    const [newFolderName, setNewFolderName] = useState((selectedFolderData === undefined) ? "" : selectedFolderData.name);
    
    const handleShow = () => {
        if (selectedFolderData !== undefined && selectedFolderData.parentId === null) {
          toast.error("You are not allowed to rename the root folder.");
          return;
        }

        setNewFolderName((selectedFolderData === undefined) ? "" : selectedFolderData.name);
        setShow(true);
    }
    const handleClose = () => setShow(false);
    const handleRenameFolder = async () => {
        setShow(false);
        
        if (selectedFolderData === undefined) {
            toast.error("No folder selected.");
            return;
        }

        try {
            const renameResponse = await RenameFolderAction(newFolderName, selectedFolderData.id);
            
            if (renameResponse === null) {
                toast.error("Error while renaming folder.");
            } else {
                console.debug("Rename Folder: {}", renameResponse);
                renameFolderEventComplete(renameResponse);
            }
        } catch (error) {
            toast.error("error: " + error);
        }
    };

    function renameFolderDisableCheck() :boolean {
      return selectedFolderId === NO_FOLDER_SELECTED 
        || (selectedFolderData !== undefined && selectedFolderData.parentId == null);
    }

    return (
        <>
        <ActionButtonBase 
            iconName="bi-input-cursor-text" 
            selectedFolder={selectedFolderId}
            onClickEvent={()=>handleShow()}
            isDisabledCheck={renameFolderDisableCheck} />
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Rename Folder</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <label htmlFor="newFolderName">Name</label>
                <input 
                    id="newFolderName" 
                    type='text' 
                    value={newFolderName}
                    onChange={(event) => setNewFolderName(event.currentTarget.value)}/>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleRenameFolder}>
                    Rename Folder
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    );
}