'use client'

import { FilearchGroup, FilearchGroupMembershipType } from "@/filearch_api/FilearchAPI";
import { Badge } from "react-bootstrap";

export default function GroupItemView({groupInfo}:{groupInfo:FilearchGroup}) {

  function getMembershipBadgeColor(x:FilearchGroupMembershipType) {
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
      <span style={{width:'70%', float: 'left', overflow: 'hidden'}}>{groupInfo.group_name}</span>
      {!groupInfo.accepted && <Badge bg="danger" style={{fontSize:"0.5em", float:'left', width:'10%', overflow:'hidden'}}>Inactive</Badge>}
      <Badge pill bg={getMembershipBadgeColor(groupInfo.group_membership_type)} style={{fontSize:"0.5em", float:'left', width:'15%', overflow:'hidden'}}>{groupInfo.group_membership_type}</Badge>
    </li>
  );
}