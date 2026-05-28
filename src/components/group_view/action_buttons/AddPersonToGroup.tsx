import ActionButtonGeneric from "@/components/action_button_generic/ActionButtonGeneric";
import { ActionResponse, FilearchGroup } from "@/filearch_api/FilearchAPI";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import { AddUsersToGroupAction } from "../actions/GroupActions";

export default function AddPersionToGroup({selectedGroup}:{selectedGroup:FilearchGroup|null}) {
  const [show, setShow] = useState(false);
  const [addUsernameToAdd, setAddUsernameToAdd] = useState<string>('');

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const handleAddUserToGroup = async () => {
    setShow(false);

    if (selectedGroup === null) {
      toast.error("No folder selected.");
      return;
    }

    const usernamesToAdd : string[] = addUsernameToAdd.split(',').map(item => item.trim());
    if (usernamesToAdd.length <= 0){
      toast.error("No username to add.");
      return;
    }

    try {
      const addUsersResponse : ActionResponse<string>[]|null = await AddUsersToGroupAction(selectedGroup.id, usernamesToAdd);
      if (addUsersResponse === null) {
        toast.error("Error adding users to group. see logs for details.");
        return;
      }

      addUsersResponse.forEach((ar)=>{
        if (ar.errors !== null && ar.errors.length > 0) {
          // display errors
          ar.errors.forEach((e)=>toast.error(e.error_message + " (" + e.error_code + ")"));
        } else {
          // display success
          toast.success("User '" + ar.data + "' added to group '" + selectedGroup.group_name + "'");
        }
      });
    } catch (error) {
      toast.error("Error adding users to group: " + error);
    }
  }

  function addPersonToGroupDisabledCheck() : boolean {
    return selectedGroup === null;
  }

  return (
    <>
    <ActionButtonGeneric
      iconName="bi-person-add"
      onClickEvent={handleShow}
      isDisabledCheck={addPersonToGroupDisabledCheck}/>
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add User to Group</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <label htmlFor="userToAddName">Username</label>
        <input id="userToAddName"
          type='text'
          value={addUsernameToAdd}
          onChange={(event) => setAddUsernameToAdd(event.currentTarget.value)}/>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleAddUserToGroup}>
          Add User
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
}