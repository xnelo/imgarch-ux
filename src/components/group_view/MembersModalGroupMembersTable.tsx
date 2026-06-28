import { ActionResponse, FilearchGroupMembershipType, FilearchGroupPermission, FilearchGroupPermissionType } from "@/filearch_api/FilearchAPI";
import styles from "./GroupView.module.css"
import { FormEvent, useState } from "react";
import { ModifyUserPermissionAction, RemoveUsersFromGroupAction } from "./actions/GroupActions";
import toast from "react-hot-toast";
import { useDialog } from "../dialogs/DialogProvider";

const editablePermissions:FilearchGroupPermissionType[] = Object.values(FilearchGroupPermissionType).filter(p=>p !== FilearchGroupPermissionType.UNKNOWN);
const permissionColumnTitles:string[] = editablePermissions.map(p => p.toString().replaceAll('_', ' '));

export interface MembersModal_CurrentUserInfo {
  userId: number;
  isGroupOwner: boolean;
  permissions: FilearchGroupPermission[];

  hasPermission(permission:FilearchGroupPermissionType) : boolean;
}

export class MembersModal_CurrentUserInfoImpl implements MembersModal_CurrentUserInfo {
  userId: number;
  isGroupOwner: boolean;
  permissions: FilearchGroupPermission[];

  constructor(userId:number, isGroupOwner:boolean, permissions:FilearchGroupPermission[]) {
    this.userId = userId;
    this.isGroupOwner = isGroupOwner;
    this.permissions = permissions;
  }

  hasPermission(permission:FilearchGroupPermissionType) : boolean {
    if (this.isGroupOwner) {
      return true;
    }

    const foundPermission:FilearchGroupPermission|undefined = this.permissions.find(i=>i.permission === permission || i.permission === FilearchGroupPermissionType.ADMIN);
    return foundPermission !== undefined;
  }
}

export interface MembersModal_GroupMemberInfo {
  userId: number;
  username: string;
  groupId: number;
  accepted: boolean;
  groupMemberType:FilearchGroupMembershipType;
  permissions: FilearchGroupPermissionType[];

  hasPermission(permission:FilearchGroupPermissionType) : boolean;
  removePermission(permission:FilearchGroupPermissionType) : void;
  addPermission(permission:FilearchGroupPermissionType) : void;
}

export class MembersModal_GroupMemberInfoImpl {
  userId: number;
  username: string;
  groupId: number;
  accepted: boolean;
  groupMemberType:FilearchGroupMembershipType;
  permissions: FilearchGroupPermissionType[];

  constructor(userId:number, username:string, groupId:number, accepted:boolean, memberType:FilearchGroupMembershipType, permissions:FilearchGroupPermissionType[]) {
    this.userId = userId;
    this.username = username;
    this.groupId = groupId;
    this.accepted = accepted;
    this.groupMemberType = memberType;
    this.permissions = permissions;
  }

  hasPermission(permission:FilearchGroupPermissionType) : boolean {
    if (this.permissions.length <= 0) {
      return false;
    }

    const foundPermission:FilearchGroupPermissionType|undefined = this.permissions.find(p=>p===permission);
    return foundPermission !== undefined;
  }

  removePermission(permission:FilearchGroupPermissionType) : void {
    this.permissions = this.permissions.filter(p=>p!==permission);
  }

  addPermission(permission:FilearchGroupPermissionType) : void {
    this.permissions = [...this.permissions, permission];
  }
}

function MembersModalMemberPermissionCheckbox({memberInfo, permissionFor, disabled}:{memberInfo:MembersModal_GroupMemberInfo, permissionFor:FilearchGroupPermissionType,disabled:boolean}) {
  const [settingPermission, setSettingPermission] = useState<boolean>(false);

  const editUserPermission = async (event:FormEvent<HTMLInputElement>) => {
    setSettingPermission(true);
    let removePermission:boolean = !event.currentTarget.checked;

    const result: ActionResponse<FilearchGroupPermission>[] = await ModifyUserPermissionAction(memberInfo.groupId, memberInfo.userId, permissionFor, removePermission);
    if (result.length <= 0) {
      toast.error("Error adding '" + permissionFor + "' permission for user " + memberInfo.username + ": No data returned");
    } else if (result.length == 1) {
      if (result[0].data !== null){
        if (removePermission) {
          memberInfo.removePermission(permissionFor);
        } else {
          memberInfo.addPermission(permissionFor);
        }
      } else {
        result[0].errors?.forEach(e => toast.error("Failed to " + (removePermission ? "removing " : "adding ") +permissionFor + " permission to " + memberInfo.username + ".\nERROR_CODE=" + e.error_code + "\nERROR_MESSAGE=" + e.error_message ));
      }
    } else if (result.length >= 2) {
      toast.error("More than 1 permission was set. This should never happen.");
    }
    setSettingPermission(false);
  }

  return (
    <div>
    {settingPermission 
    ? <img className={styles.rotate_image} src="/loading.png" width={17} height={17} style={{ filter: 'invert(1) opacity(0.333)', position: 'relative', top: '-2px' }}/> 
    : <input 
      className="form-check-input" 
      type="checkbox" 
      onClick={(event)=>editUserPermission(event)} 
      defaultChecked={memberInfo.hasPermission(permissionFor)} 
      disabled={disabled}/>}
    </div>);
}

function MembersModalGroupMemberItemView({memberInfo, currentUserId, canEditUserPermissions, canRemoveUser, removeMemberFunc}:{memberInfo:MembersModal_GroupMemberInfo, currentUserId:number, canEditUserPermissions:boolean, canRemoveUser:boolean, removeMemberFunc:(username:string)=>void}) {
  const memberIsCurrentUser: boolean = memberInfo.userId === currentUserId;

  const deleteUser = async (username:string) => {
    const result:ActionResponse<string>[]|null = await RemoveUsersFromGroupAction(memberInfo.groupId, [username]);
    if (result === null) {
      toast.error("Error removing user(" + username + ") from group.");
    } else { 
      result.forEach(ar => {
        if (ar.errors !== null && ar.errors.length > 0) {
          ar.errors.forEach(e=>toast.error("Error removing " + username + " from group. (" + e.error_code + ")" + e.error_message));
        } else if (ar.data == null) {
          toast.error("Data AND errors are null. THIS SHOULD NEVER HAPPEN. Contact Support.");
        } else {
          removeMemberFunc(ar.data);
        }
      });
    }
  }

  const { openYesNoDialog } = useDialog();

  const handleRemoveClicked = (username:string) => {
    openYesNoDialog("Are You Sure?",
      <p>Do you really want to remove <b>{username}</b>?</p>,
      () => deleteUser(username)
    );
  };
  
 return (
    <tr>
      <td>{memberInfo.username}</td>
      {canEditUserPermissions && editablePermissions.map(p=><td key={`permission_${memberInfo.userId}_${p}`}><MembersModalMemberPermissionCheckbox memberInfo={memberInfo} permissionFor={p} disabled={memberIsCurrentUser}/></td>)}
      {canRemoveUser &&<td>{!memberIsCurrentUser && <a className={styles.DefaultAnchor} onClick={() => handleRemoveClicked(memberInfo.username)} >Remove</a>}</td>}
    </tr>
  );
}

export default function MembersModalGroupMembersTable({currentUserPermissionInfo, groupMembers}:{currentUserPermissionInfo:MembersModal_CurrentUserInfo|null, groupMembers:MembersModal_GroupMemberInfo[]}) {
  const [currentMembers, setCurrentMembers] = useState<MembersModal_GroupMemberInfo[]>(groupMembers);

  const removeMember = (usernameToRemove:string) => {
    setCurrentMembers(currentMembers.filter(u=>u.username !== usernameToRemove));
  }

  const currentUserCanEditUserPermissions: boolean = currentUserPermissionInfo==null? false : currentUserPermissionInfo.hasPermission(FilearchGroupPermissionType.EDIT_MEMBER_PERMISSIONS);
  const currentUserCanRemoveUsers: boolean = currentUserPermissionInfo==null? false : currentUserPermissionInfo.hasPermission(FilearchGroupPermissionType.REMOVE_MEMBERS);

  return (
    <div className={styles.MembersTableContainer}>
      <table className="table">
        <thead>
        <tr>
          <th>username</th>
          {currentUserCanEditUserPermissions && permissionColumnTitles.map(pt=><th key={pt}>{pt}</th>)}
          {currentUserCanRemoveUsers && <th>remove</th>}
        </tr>
        </thead>
        <tbody>
          {currentMembers.map(i=><MembersModalGroupMemberItemView 
            key={i.userId} 
            memberInfo={i} 
            currentUserId={currentUserPermissionInfo==null?-1:currentUserPermissionInfo.userId} 
            canEditUserPermissions={currentUserCanEditUserPermissions} 
            canRemoveUser={currentUserCanRemoveUsers} 
            removeMemberFunc={removeMember}/>)}
        </tbody>
      </table>
    </div>
  );
}
