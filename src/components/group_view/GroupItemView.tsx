'use client'

import { FilearchGroup, FilearchGroupMembershipType } from "@/filearch_api/FilearchAPI";
import { Badge, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import styles from "./GroupView.module.css";
import { useDialog } from "../dialogs/DialogProvider";
import { ActivateGroupInvite } from "./actions/GroupActions";
import toast from "react-hot-toast";

export default function GroupItemView({groupInfo, selectedGroupId, selectGroupEvent, showMembersModal}:{groupInfo:FilearchGroup, selectedGroupId:number, selectGroupEvent:(id:number)=>void, showMembersModal:(groupId:number)=>void}) {

  function selectGroupFunc(groupId: number):void {
    selectGroupEvent(groupId);
  }

  function getMembershipBadgeColor(x:FilearchGroupMembershipType):string {
    if (x === FilearchGroupMembershipType.OWNER) {
      return "success";
    } else if (x === FilearchGroupMembershipType.ADMIN) {
      return "warning";
    } else {
      return "info";
    }
  }

  const { openYesNoDialog } = useDialog();

  async function handleActivation(groupId:number, groupName:string) {
    const successfulActivation = await ActivateGroupInvite(groupId);
    if (successfulActivation) {
      toast.success("Invitation to '"+groupName+"'(" + groupId +") accepted.");
    } else {
      toast.error("Unable to accept invite to '" + groupName + "'("+ groupId + ").");
    }
  }

  async function handleActivationClick(groupId: number, groupName:string):Promise<void> {
    openYesNoDialog("Accept Group Invitation", 
      <span>Do you want to accept invite to group '{groupName}({groupId})'?</span>,
      ()=>handleActivation(groupId, groupName)
    );
  }

  return (
    <li className={selectedGroupId == groupInfo.id ? `${styles.GroupItemSelected}` : ""}>
      <a className={styles.GroupName}
        onClick={() => selectGroupFunc(groupInfo.id)}>
        <span>{groupInfo.group_name}</span>
      </a>
      {!groupInfo.accepted && 
      <Badge bg="danger" style={{fontSize:"0.5em", width:'10%', overflow:'hidden', top:'5px', position: 'relative'}}>
        <OverlayTrigger overlay={<Tooltip id="handleActivation">Click to join the group.</Tooltip>}>
        <a className={styles.DefaultAnchor} style={{color:"white"}} onClick={()=>handleActivationClick(groupInfo.id, groupInfo.group_name)}>Inactive</a>
        </OverlayTrigger>
      </Badge>}
      <Badge pill bg={getMembershipBadgeColor(groupInfo.group_membership_type)} style={{fontSize:"0.5em", width:'15%', overflow:'hidden', top:'5px', position: 'relative'}}>{groupInfo.group_membership_type}</Badge>
      {groupInfo.accepted &&
        <Button variant="tertiary" className={styles.GroupItemMembersButton} onClick={() => showMembersModal(groupInfo.id)}>
          <i className="bi bi-people"></i>
        </Button>
      }
    </li>
  );
}