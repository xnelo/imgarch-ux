'use client'

import { useState } from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ActionButtonBase from "./ActionButtonBase";
import { FilearchFolder } from "@/filearch_api/folder";
import { AddFolderAction } from "../actions/FolderActions";

export default function AddFolder({selectedFolder, addFolderEventComplete}:{selectedFolder:number, addFolderEventComplete:(folderToAdd:FilearchFolder)=>void}) {
    const [show, setShow] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);
    const handleAddFolder = async () => {
        setShow(false);

        try {
            const addFolderResponse = await AddFolderAction(newFolderName, selectedFolder);

            if (addFolderResponse === null) {
                console.error("Error while adding new folder [AddFolder.tsx].");
            } else {
                console.debug("New Folder: {}", addFolderResponse);
                addFolderEventComplete(addFolderResponse);
            }
        } catch (error) {
            console.error("error: ", error);
        }
    }

    return (
        <>
        <ActionButtonBase 
            iconName="bi-folder-plus" 
            selectedFolder={selectedFolder}
            onClickEvent={handleShow}/>
        
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>New Folder Name</Modal.Title>
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
                <Button variant="primary" onClick={handleAddFolder}>
                    New Folder
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    );
}