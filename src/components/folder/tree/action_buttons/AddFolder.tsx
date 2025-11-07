'use client'

import { useState } from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ActionButtonBase from "./ActionButtonBase";
import useSession from "@/hooks/useSession";
import { FilearchFolder } from "@/filearch_api/folder";

export default function AddFolder({selectedFolder, addFolderEventComplete}:{selectedFolder:number, addFolderEventComplete:(folderToAdd:FilearchFolder)=>void}) {
    const [show, setShow] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const session = useSession();

    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);
    const handleAddFolder = async () => {
        setShow(false);
        
        const folderRequest = {
            owner_user_id: session.session?.userInfo?.registration_info?.user_id,
            parent_id: selectedFolder,
            folder_name: newFolderName
        };

        try {
            const response = await fetch("/folder/add",{
                method: 'POST',
                headers: {
                    'accept': 'application/json'
                },
                body: JSON.stringify(folderRequest)
            });

            if (response.status != 200) {
                console.error("Error while adding new folder [AddFolder.tsx].");
            } else {
                const newFolderData = await response.json();
                console.debug("New Folder: {}", newFolderData);
                addFolderEventComplete(newFolderData);
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