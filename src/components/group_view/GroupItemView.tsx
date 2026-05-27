'use client'

import { FilearchGroup, FilearchGroupMembershipType } from "@/filearch_api/FilearchAPI";
import { Badge } from "react-bootstrap";
import styles from "./GroupView.module.css";

export default function GroupItemView({groupInfo, selectGroupEvent}:{groupInfo:FilearchGroup, selectGroupEvent:(id:number)=>void}) {

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
    <li style={{background: 'green'}}>
      <a
        className={`${styles.GroupName} `}
       onClick={() => selectGroupFunc(groupInfo.id)}>
        <span>{groupInfo.group_name}</span>
      </a>
      {!groupInfo.accepted && <Badge bg="danger" style={{fontSize:"0.5em", float:'left', width:'10%', overflow:'hidden'}}>Inactive</Badge>}
      <Badge pill bg={getMembershipBadgeColor(groupInfo.group_membership_type)} style={{fontSize:"0.5em", float:'left', width:'15%', overflow:'hidden'}}>{groupInfo.group_membership_type}</Badge>
    </li>
  );
}