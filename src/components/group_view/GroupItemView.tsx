'use client'

import { FilearchGroup, FilearchGroupMembershipType } from "@/filearch_api/FilearchAPI";
import { Badge } from "react-bootstrap";
import styles from "./GroupView.module.css";

export default function GroupItemView({groupInfo, selectedGroupId, selectGroupEvent}:{groupInfo:FilearchGroup, selectedGroupId:number, selectGroupEvent:(id:number)=>void}) {

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

  return (
    <li className={selectedGroupId == groupInfo.id ? `${styles.GroupItemSelected}` : ""}>
      <a className={styles.GroupName}
        onClick={() => selectGroupFunc(groupInfo.id)}>
        <span>{groupInfo.group_name}</span>
      </a>
      {!groupInfo.accepted && <Badge bg="danger" style={{fontSize:"0.5em", width:'10%', overflow:'hidden'}}>Inactive</Badge>}
      <Badge pill bg={getMembershipBadgeColor(groupInfo.group_membership_type)} style={{fontSize:"0.5em", width:'15%', overflow:'hidden'}}>{groupInfo.group_membership_type}</Badge>
    </li>
  );
}