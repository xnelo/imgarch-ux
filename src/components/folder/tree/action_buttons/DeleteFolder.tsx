'use client'
import { MouseEvent, useState } from "react";
import ActionButtonBase from "./ActionButtonBase";
import { FolderItem } from "../../FolderItem";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { ActionResponse } from "@/filearch_api/FilearchAPI";
import { FilearchFolder } from "@/filearch_api/folder";

export default function DeleteFolder({selectedFolder, selectedFolderData, deleteFolderEventComplete}: {selectedFolder: number, selectedFolderData: FolderItem|undefined, deleteFolderEventComplete: (deletedId: number)=>void}) {
    const [show, setShow] = useState(false);
    
    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);
    const handleDeleteFolder = async (idToDelete:number)=>{
        setShow(false);
        
        try {
            const response = await fetch("/folder/delete/" + idToDelete, {
                method: 'DELETE',
                headers: {
                    'accept': 'application/json'
                }
            });

            if (response.status != 200) {
                console.error("Could not delete folder " + idToDelete);
            } else {
                const deleteFolderData:ActionResponse<FilearchFolder>[] = await response.json();
                console.debug("Deleted folder: {}", deleteFolderData);
                deleteFolderData.forEach(actionResponse => {
                    if (actionResponse.errors !== null) {
                        // TODO: handle errors
                        actionResponse.errors.forEach(error=>alert("error: " + error.error_message + "(" + error.error_code + ")[" + error.http_code + "]"));
                    } else if (actionResponse.data !== null) {
                        deleteFolderEventComplete(actionResponse.data.id);
                    } else {
                        // TODO: alert error
                        alert("There were no errors nor data... This shouldn't happen");
                    }
                });
            }
        } catch (error) {
            console.error("Error deleting folder: ", error);
        }
    }

    return (
        <>
        <ActionButtonBase 
            iconName="bi-folder-minus" 
            selectedFolder={selectedFolder}
            onClickEvent={handleShow} />
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Rename Folder</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <span>Are you sure you want to delete '{selectedFolderData?.name}({selectedFolder})'?</span>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    No
                </Button>
                <Button variant="primary" onClick={()=>handleDeleteFolder(selectedFolder)}>
                    Yes
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    );
}