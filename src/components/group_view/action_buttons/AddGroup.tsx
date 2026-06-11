'use client'

import ActionButtonGeneric from "@/components/action_button_generic/ActionButtonGeneric";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { CreateGroup } from "../actions/GroupActions";
import { FilearchGroup } from "@/filearch_api/FilearchAPI";

export default function AddGroup({addGroupEventComplete}: {addGroupEventComplete:(groupToAdd:FilearchGroup)=>void}) {
  const [show, setShow] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const handleAddGroup = async () => {
    setShow(false);
    
    try{
      const addGroupResponse = await CreateGroup(newGroupName);

      if (addGroupResponse === null || addGroupResponse === undefined) {
        console.error("Error while adding new group.");
      } else {
        console.debug("New Group: {}", addGroupResponse);
        addGroupEventComplete(addGroupResponse);
      }
    } catch (error) {
      console.error("error: ", error);
    }
  }

  return(
    <>
    <ActionButtonGeneric
      iconName="bi-plus"
      onClickEvent={handleShow}/>

    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>New Group Name</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <label htmlFor="newGroupName">Name</label>
        <input 
            id="newGroupName" 
            type='text' 
            value={newGroupName}
            onChange={(event) => setNewGroupName(event.currentTarget.value)}/>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
            Close
        </Button>
        <Button variant="primary" onClick={handleAddGroup}>
            New Group
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
}
