'use client'
import { MouseEvent, useState } from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ActionButtonBase from "./ActionButtonBase";
import { FolderItem } from "../../FolderItem";
import { FilearchFolder } from "@/filearch_api/folder";

export default function RenameFolder({selectedFolderId, selectedFolderData, renameFolderEventComplete}: {selectedFolderId:number, selectedFolderData: FolderItem|undefined, renameFolderEventComplete:(toRename:FilearchFolder)=>void}) {

    const [show, setShow] = useState(false);
    
    const [newFolderName, setNewFolderName] = useState((selectedFolderData === undefined) ? "" : selectedFolderData.name);
    
    const handleShow = (folderName:string|undefined) => {
        setNewFolderName((selectedFolderData === undefined) ? "" : selectedFolderData.name);
        setShow(true);
    }
    const handleClose = () => setShow(false);
    const handleRenameFolder = async () => {
        setShow(false);
        
        if (selectedFolderData === undefined) {
            alert("No folder selected.");
            return;
        }

        alert("Rename Folder to " + newFolderName);

        const renameRequest = {
            id: selectedFolderData.id,
            folder_name: newFolderName
        };

        try {
            const response = await fetch("/folder/rename", {
                method: 'POST',
                headers:{
                    'accept': 'application/json'
                },
                body: JSON.stringify(renameRequest)
            });
            
            if (response.status != 200) {
                console.error("Error while renaming folder.");
            } else {
                const renameFolderData = await response.json();
                console.debug("Rename Folder: {}", renameFolderData);
                renameFolderEventComplete(renameFolderData);
            }
        } catch (error) {
            console.error("error: " , error);
        }
    };

    return (
        <>
        <ActionButtonBase 
            iconName="bi-input-cursor-text" 
            selectedFolder={selectedFolderId}
            onClickEvent={()=>handleShow(selectedFolderData?.name)} />
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