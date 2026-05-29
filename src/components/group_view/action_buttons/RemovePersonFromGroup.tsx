import ActionButtonGeneric from "@/components/action_button_generic/ActionButtonGeneric";
import { ActionResponse, FilearchGroup, FilearchGroupMember, FilearchGroupMembershipType } from "@/filearch_api/FilearchAPI";
import { ChangeEvent, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import { GetMembersInGroupAction, RemoveUsersFromGroupAction } from "../actions/GroupActions";

export default function RemovePersonFromGroup({selectedGroup}:{selectedGroup:FilearchGroup|null}) {
  const [show, setShow] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<FilearchGroupMember[]>([]);
  const [membersInGroup, setMembersInGroup] = useState<FilearchGroupMember[]>([]);

  const handleShow = async () => {
    if (selectedGroup === null) {
      toast.error("No group selected.");
      return; 
    }

    let members: FilearchGroupMember[] = await GetMembersInGroupAction(selectedGroup.id);
    members = members.filter(i=>i.user_id != selectedGroup.owner_user_id); //remove owner of the group... they can never be removed this way.
    setMembersInGroup(members);

    setShow(true);
  }

  const handleClose = () => {
    setShow(false);
    setSelectedMembers([]);
    setMembersInGroup([]);
  }

  const handleRemoveUsersFromGroup = async () => {
    const usernamesToRemove = selectedMembers.map(i=>i.username);
    // now we have everyone to remove: close the window and clear selected list
    handleClose();

    if (usernamesToRemove.length <= 0) {
      toast.error("No members selected for removal.");
      return;
    }

    if (selectedGroup === null) {
      toast.error("No group selected.");
      return;
    }

    try{
      const removeUsersResponse: ActionResponse<string>[]|null = await RemoveUsersFromGroupAction(selectedGroup.id, usernamesToRemove);
      if (removeUsersResponse === null) {
        toast.error("Error removing users from group. See logs for details.");
        return;
      }

      removeUsersResponse.forEach((ar)=>{
        if (ar.errors !== null && ar.errors.length > 0) {
          ar.errors.forEach((e)=>toast.error(e.error_message + " (" + e.error_code + ")"));
        } else {
          toast.success("User '" + ar.data + "' removed from group '" + selectedGroup.group_name + "'");
        }
      });
    } catch (error) {
      toast.error("Error removing users from group: " + error);
    }
  };

  const handleCheckboxChange = (event:ChangeEvent<HTMLInputElement>, itemChanged: FilearchGroupMember):void =>{
    if(event.currentTarget.checked) {
      setSelectedMembers([...selectedMembers, itemChanged]);
    } else {
      setSelectedMembers(selectedMembers.filter(i=>i.user_id != itemChanged.user_id));
    }
  }
  
  function removePersonFromGroupDisabledCheck() : boolean {
    return selectedGroup === null;
  }

  return (
    <>
    <ActionButtonGeneric
      iconName="bi-person-dash"
      onClickEvent={handleShow}
      isDisabledCheck={removePersonFromGroupDisabledCheck}/>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Remove User From Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label htmlFor="usersToRemove">Users To Remove</label>
          <div style={{height:'25vh', overflow:'scroll'}}>
            {membersInGroup.length > 0 ?
            <ul style={{listStyle:'none', paddingLeft:'5px'}}>
              {membersInGroup.map(i=>
                <li key={i.user_id}>
                  <input type="checkbox" className="form-check-input" onChange={(event)=>handleCheckboxChange(event, i)}/>
                  <span style={{marginLeft:'10px'}}>{i.username}</span>
                </li>)}
            </ul> : <span>NO USERS TO REMOVE</span>}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRemoveUsersFromGroup} disabled={membersInGroup.length <= 0 || selectedMembers.length <= 0}>
            Remove Users
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}