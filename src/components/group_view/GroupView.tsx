'use client'

import { Suspense, use, useState } from "react";
import GroupItemView from "./GroupItemView";
import styles from "./GroupView.module.css"
import { FIlearchAllGroupPermission, FilearchGroup, FilearchGroupFile, FilearchGroupMember, FilearchGroupPermission, FilearchGroupPermissionType, PaginationContract } from "@/filearch_api/FilearchAPI";
import { Modal } from "react-bootstrap";
import AddGroup from "./action_buttons/AddGroup";
import RemoveGroup from "./action_buttons/RemoveGroup";
import AddPersionToGroup from "./action_buttons/AddPersonToGroup";
import RemovePersonFromGroup from "./action_buttons/RemovePersonFromGroup";
import { GetAllUserPermissionsAction, GetCurrentUserId, GetCurrentUserPermissions, GetGroupFiles, GetMembersInGroupAction } from "./actions/GroupActions";
import MembersModalGroupMembersTable, { MembersModal_CurrentUserInfo, MembersModal_CurrentUserInfoImpl, MembersModal_GroupMemberInfo, MembersModal_GroupMemberInfoImpl } from "./MembersModalGroupMembersTable";
import FilesViewer from "../file_viewer/FilesViewer";

export const NO_GROUP_SELECTED: number = -1;

function findGroupInGroups(groups:FilearchGroup[]|null, groupId:number):FilearchGroup|null {
  if (groups === null || groupId < 0){
    return null;
  }
  
  const retVal = groups.find(g=>g.id === groupId);
  if (retVal === undefined){
    return null;
  } else {
    return retVal;
  }
}

function combineGroupInfoAndPermissionInfo(groupMembers:FilearchGroupMember[], groupMemberPermissions:FIlearchAllGroupPermission[]) : MembersModal_GroupMemberInfo[] {
  return groupMembers.map(mem=>{
    const memberPermissions: FIlearchAllGroupPermission|undefined = groupMemberPermissions.find(perm=>perm.user_id===mem.user_id);
    return new MembersModal_GroupMemberInfoImpl(
      mem.user_id, 
      mem.username, 
      mem.group_id, 
      mem.accepted, 
      mem.group_member_type,
      memberPermissions===undefined?[]:memberPermissions.permissions);
  });
}

export default function GroupView({groups}:{groups: Promise<FilearchGroup[]|null>}) {
  const tmpAllGroups = use(groups);
    if (tmpAllGroups === null) {
      return (
        <div>ERROR LOADING GROUPS!</div>
      );
    }

  let [allGroups, setAllGroups] = useState<FilearchGroup[] | null>(tmpAllGroups);
  let [selectedGroup, setSelectedGroup] = useState<number>(NO_GROUP_SELECTED);
  let [selectedGroupData, setSelectedGroupData] = useState<FilearchGroup|null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  function selectGroupEvent(groupSelectedId:number):void {
    if (groupSelectedId === selectedGroup) {
      setSelectedGroup(NO_GROUP_SELECTED);
      setSelectedGroupData(null);
      setRefreshTrigger(prev => prev + 1);
    } else {
      setSelectedGroup(groupSelectedId);
      setSelectedGroupData(findGroupInGroups(allGroups, groupSelectedId));
      setRefreshTrigger(prev => prev + 1);
    }
  }

  function addGroupEventComplete(groupToAdd: FilearchGroup) {
    if (allGroups === null) {
      setAllGroups([groupToAdd]);
    } else {
      setAllGroups([...allGroups, groupToAdd]);
    }
  }

  function deleteGroupEventComplete(deletedGroup: FilearchGroup):void {
    if (deletedGroup === null) {
      console.debug("Group is null. Doing nothing.");
      return;
    }

    if (allGroups !== null) {
      setAllGroups(allGroups.filter(a => a.id !== deletedGroup.id));
      setSelectedGroup(NO_GROUP_SELECTED);
      setSelectedGroupData(null);
      setRefreshTrigger(prev => prev + 1);
    }
  }

  const [membersModalGroup, setMembersModalGroup] = useState<FilearchGroup|null>(null);
  const [membersModalShow, setMembersModalShow] = useState<boolean>(false);
  const [membersModalMembers, setMembersModalMembers] = useState<MembersModal_GroupMemberInfo[]>([]);
  const [currentUserPermissionInfo, setCurrentUserPermissionInfo] = useState<MembersModal_CurrentUserInfo|null>(null);

  const handleClose = () => setMembersModalShow(false);

  async function groupMembersModalOpen(groupId:number) : Promise<void> {
    const currGroup:FilearchGroup|null = findGroupInGroups(allGroups, groupId);
    const allMembers:FilearchGroupMember[] = await GetMembersInGroupAction(groupId);
    const allUsersPermissions:FIlearchAllGroupPermission[] = await GetAllUserPermissionsAction(groupId);
    const finalAllMembers:MembersModal_GroupMemberInfo[] = combineGroupInfoAndPermissionInfo(allMembers, allUsersPermissions);
    const userPermissions:FilearchGroupPermission[] = await GetCurrentUserPermissions(groupId);
    const localCurrentUserId:number|null = await GetCurrentUserId();
    const isGroupOwner:boolean = localCurrentUserId !== null && currGroup !== null && currGroup.owner_user_id === localCurrentUserId;
    const userPermissionInfo:MembersModal_CurrentUserInfo = new MembersModal_CurrentUserInfoImpl(localCurrentUserId!=null?localCurrentUserId:-1, isGroupOwner, userPermissions);
    
    
    setMembersModalGroup(currGroup);
    setCurrentUserPermissionInfo(userPermissionInfo);
    setMembersModalMembers(finalAllMembers);
    setMembersModalShow(true);
  }

  async function GetGroupFiles_Internal(afterId: number | null) : Promise<PaginationContract<FilearchGroupFile>|null> {
    if (selectedGroup === NO_GROUP_SELECTED) {
      return null;
    } else {
      return await GetGroupFiles(selectedGroup, afterId);
    }
  }

  return (
      <>
      <Modal show={membersModalShow} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>'{membersModalGroup?.group_name}' Members</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {membersModalMembers.length <= 0 ? 
              <span>NO DATA</span> :
              <MembersModalGroupMembersTable currentUserPermissionInfo={currentUserPermissionInfo} groupMembers={membersModalMembers}/>
            }
        </Modal.Body>
      </Modal>
      <div className='container-fluid'>
        <div className="position-absolute bg-body-tertiary"
          style={{
            width: 'calc(25vw - 1rem)',
            height: 'calc(100vh - 5.75rem)',
            marginLeft: '1rem',
            paddingTop: '1rem',
            left: '0px',
            borderRight: 'var(--bs-border-color) 1px solid'
          }}>
          <div className="container">
            <AddGroup addGroupEventComplete={addGroupEventComplete}/>
            <RemoveGroup selectedGroup={selectedGroupData} deleteGroupEventComplete={deleteGroupEventComplete}/>
            <AddPersionToGroup selectedGroup={selectedGroupData}/>
            <RemovePersonFromGroup selectedGroup={selectedGroupData}/>
          </div>
          <div className='position-absolute overflow-y-scroll overflow-x-scroll'
              style={{
                width: 'calc(25vw - 1.05rem)',
                height: 'calc(100vh - 8.75rem)'
              }}>
            <div>
              <Suspense fallback={<div>Loading...</div>}>
                {(allGroups === null || allGroups.length <= 0) 
                  ? <div>NO DATA</div>
                  : <ul className={styles.GroupList}>{allGroups.map(i => <GroupItemView key={i.id} groupInfo={i} selectedGroupId={selectedGroup} selectGroupEvent={selectGroupEvent} showMembersModal={groupMembersModalOpen}/>)}</ul>
                }
              </Suspense>
            </div>
          </div>
        </div>
        <div
          className='position-absolute overflow-y-noscroll'
          style={{
            width: '75vw',
            height: 'calc(100vh - 7.75rem)',
            left: '25vw'
          }}>
          <Suspense fallback={<div>Loading...</div>}>
            <FilesViewer
              getFileFunction={GetGroupFiles_Internal}
              refreshTrigger={refreshTrigger}
              style={{
                height: 'calc(100vh - 5.75rem)', 
                width: '100%', 
                paddingLeft: '1vw'}}
              />
          </Suspense>
        </div>
      </div>
      </>
    );
}