'use server'

import { ActionResponse, FIlearchAllGroupPermission, FilearchGroupFile, FilearchGroupItem, FilearchGroupMember, FilearchGroupPermission, FilearchGroupPermissionType, PaginationContract } from "@/filearch_api/FilearchAPI";
import { AcceptInvite, AddGroupItems, AddPeopleToGroup, CreateNewGroup, DeleteGroup, GetAllUserPermissionsForGroup, GetGroupPermissions, GetMembersInGroup, GetPaginatedGroupFiles, ModifyPermission, RemovePeopleFromGroup } from "@/filearch_api/group";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function CreateGroup(group_name: string) {
  logger.debug("Adding group with name " + group_name);

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return null;
  }
  
  return await CreateNewGroup(session.access_token, group_name);
}

export async function DeleteGroupAction(groupId: number) {
  logger.debug("Deleting group with id: " + groupId);

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return null;
  }

  return await DeleteGroup(session.access_token, groupId);
}

export async function AddUsersToGroupAction(groupId: number, usersToAdd:string[]): Promise<ActionResponse<string>[] | null> {
  logger.debug("Adding users to group. groupId: " + groupId + " usernames: " +usersToAdd );

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return null;
  }

  return await AddPeopleToGroup(session.access_token, groupId, usersToAdd);
}

export async function GetMembersInGroupAction(groupId: number) : Promise<FilearchGroupMember[]> {
  logger.debug("Getting members in group. groupId: " + groupId);

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return [];
  }

  return await GetMembersInGroup(session.access_token, groupId);
}

export async function RemoveUsersFromGroupAction(groupId:number, usersToRemove:string[]): Promise<ActionResponse<string>[] | null> {
  logger.debug("Removing users from group. groupId: " + groupId + " usernames: " +usersToRemove );

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return null;
  }

  return await RemovePeopleFromGroup(session.access_token, groupId, usersToRemove);
}

export async function GetCurrentUserPermissions(groupId:number):Promise<FilearchGroupPermission[]> {
  logger.debug("Getting current users permission for group. group_id=" + groupId);

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return [];
  }

  if (session.userInfo === undefined || session.userInfo.registration_info === undefined) {
    logger.error("User information is undefined.");
    return [];
  }

  return await GetGroupPermissions(session.access_token, groupId, session.userInfo.registration_info.user_id);
}

export async function GetCurrentUserId():Promise<number|null> {
   const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return null;
  }

  if (session.userInfo === undefined || session.userInfo.registration_info === undefined) {
    logger.error("User information is undefined.");
    return null;
  }

  return session.userInfo.registration_info.user_id;
}

export async function GetAllUserPermissionsAction(groupId:number) : Promise<FIlearchAllGroupPermission[]> {
  logger.debug("Getting all user permissions for group. group_id=" + groupId);

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return [];
  }

  return await GetAllUserPermissionsForGroup(session.access_token, groupId);
}

export async function ModifyUserPermissionAction(groupId:number, userId:number, permission:FilearchGroupPermissionType, removePermission:boolean) : Promise<ActionResponse<FilearchGroupPermission>[]> {
  logger.debug("Modifying user permission. groupId=" + groupId + " userId=" + userId + " permission=" + permission + " removePermission=" + removePermission);

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return [];
  }

  return await ModifyPermission(session.access_token, groupId, userId, permission, removePermission);
}

export async function GetGroupFiles(groupId:number, afterId: number|null): Promise<PaginationContract<FilearchGroupFile> | null> {
  logger.debug("Getting all files in group. group_id=" + groupId);

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return null;
  }

  return await GetPaginatedGroupFiles(session.access_token, groupId, afterId, 20);
}

export async function AddGroupItemsAction(
  groupId:number, 
  itemsToAdd:FilearchGroupItem[] | null): Promise<ActionResponse<FilearchGroupItem>[] | null> {
  logger.debug("Adding items to group. group_id=" + groupId + " itemsToAdd="+itemsToAdd);

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return null;
  }

  return await AddGroupItems(session.access_token, groupId, itemsToAdd);
}

export async function ActivateGroupInvite(groupId:number): Promise<boolean>{
  logger.debug("Acepting goup invite. group_id=" + groupId);

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return false;
  }

  return await AcceptInvite(session.access_token, groupId);
}