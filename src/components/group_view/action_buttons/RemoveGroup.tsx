import ActionButtonGeneric from "@/components/action_button_generic/ActionButtonGeneric";
import { FilearchGroup } from "@/filearch_api/FilearchAPI";
import { group } from "console";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import { DeleteGroupAction } from "../actions/GroupActions";

export default function RemoveGroup({selectedGroup, deleteGroupEventComplete}: {selectedGroup:FilearchGroup|null, deleteGroupEventComplete:(deletedGroup:FilearchGroup)=>void}) {
  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const handleDeleteGroup = async (groupId:number|undefined) => {
    setShow(false);

    if (groupId === undefined || groupId < 0) { 
      toast.error("Group Id must be > 0. group_id=" + groupId);
      return;
    }

    try {
      const deleteResult = await DeleteGroupAction(groupId);

      if (deleteResult === null) {
        toast.error("Could not delete group");
      } else {
        toast.success("Successfully deleted group: " + deleteResult?.group_name);
        if (deleteResult !== undefined) {
          deleteGroupEventComplete(deleteResult);
        }
      }
    } catch (error) {
      toast.error("Error deleting group: " + error);
    }
  };

  function removeGroupDisableCheck():boolean {
    return selectedGroup === null || selectedGroup.group_membership_type !== "OWNER";
  }

  return(
    <>
    <ActionButtonGeneric 
      iconName="bi-people"
      onClickEvent={handleShow}
      isDisabledCheck={removeGroupDisableCheck}/>
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Remove Group</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span>Are you sure you want to delete '{selectedGroup?.group_name}'?</span>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          No
        </Button>
        <Button variant="primary" onClick={()=>handleDeleteGroup(selectedGroup?.id)}>
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
}