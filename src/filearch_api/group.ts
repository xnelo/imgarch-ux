import logger from "@/lib/logger";
import { ActionResponse, ActionType, FIlearchAllGroupPermission, FilearchAPIResponse, FilearchGroup, FilearchGroupFile, FilearchGroupItem, FilearchGroupMember, FilearchGroupPermission, FilearchGroupPermissionType, GroupItemType, HandleActionResponse, HandleErrorResponse, PaginationContract, ResourceType, SortDirection } from "./FilearchAPI";
import { GetAllPaginatedData, logActionResponseErrors, SinglePaginatedCall } from "./FilearchAPI_ServerFunctions";
import { log } from "console";

const GROUPIN_LIMIT_PER_REQUEST:number = 25;

export async function GetGroupsIn(accessToken: string): Promise<FilearchGroup[] | null> {
  const additionalParams: [string,string][] = [["membership_status", "ALL"]];
  const data: FilearchGroup[] | null = 
    await GetAllPaginatedData(accessToken, 
                              process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/group/groups_in", 
                              SortDirection.ASCENDING, 
                              GROUPIN_LIMIT_PER_REQUEST, 
                              ResourceType.GROUP, 
                              additionalParams);

  return data;
}

export async function CreateNewGroup(accessToken: string, groupName: string) {
  const newGroupData = {
    group_name: groupName
  };

  try {
    const createGroupResponse = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/group",
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGroupData)
      });

    if (createGroupResponse.status != 200) {
      logger.error("Error while creating new group.");
      HandleErrorResponse(await createGroupResponse.json());
      return null;
    }

    const data = await createGroupResponse.json();
    const actionRespons: ActionResponse<FilearchGroup> = data.action_responses[0];
    return actionRespons.data;
  } catch (error) {
    logger.error("Error creating group: ", error);
  }
}

export async function DeleteGroup(accessToken: string, groupId: number) {
  try {
    const deleteGroupResponse = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/group/" + groupId,
      {
        method: "DELETE",
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }
      }
    );

    if (deleteGroupResponse.status != 200) {
      logger.error("Error while deleteing group (" + groupId + ").");
      HandleErrorResponse(await deleteGroupResponse.json());
      return null;
    }

    const data = await deleteGroupResponse.json();
    const actionResponse: ActionResponse<FilearchGroup> = data.action_responses[0];
    return actionResponse.data;
  } catch (error) {
    logger.error("Error deleting group: ", error);
  }
}

export async function AddPeopleToGroup(accessToken: string, groupId: number, usersToAdd: string[]) : Promise<ActionResponse<string>[]> {
  const addToGroupData = {
    user_to_add: usersToAdd
  };
  try {
    const addToGroupResponse = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/group/" + groupId + "/add_users",
      {
        method: "POST",
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addToGroupData)
      });
      
      const responseData:FilearchAPIResponse<string> = await addToGroupResponse.json();
      return responseData.action_responses;
  } catch (error) {
    logger.error("Error adding users to group: " + error);
    return [
      {
        type:ResourceType.GROUP,
        action:ActionType.ADD_USER_TO_GROUP,
        data:null, 
        errors:[
          {
            error_code:7000,
            error_message:"Error adding user to group. See Logs for details.",
            http_code:500
          }
        ]
      }
    ];
  }
}

export async function GetMembersInGroup(accessToken: string, groupId: number) : Promise<FilearchGroupMember[]> {
  try{
    const membersInGroupResponse = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/group/" + groupId + "/users_in_group",
      {
        method: "GET",
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }
      });
    
    if (membersInGroupResponse.status != 200) {
      HandleErrorResponse(await membersInGroupResponse.json());
      return [];
    } else {
      const data:FilearchAPIResponse<FilearchGroupMember[]> = await membersInGroupResponse.json();
      const returnData: FilearchGroupMember[] | null = data.action_responses[0].data;
      if (returnData === null) {
        return [];
      } else {
        return returnData;
      }
    }
  } catch (error) {
    logger.error("Error while getting group members: group_id=" + groupId + " error: " + error);
    return [];
  }
}

export async function RemovePeopleFromGroup(accessToken: string, groupId:number, usersToRemove:string[]) : Promise<ActionResponse<string>[]> {
  const removeFromGroupData = {
    user_to_remove: usersToRemove
  }
  try{
    const removeFromGroupResponse = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/group/" + groupId + "/remove_users",
      {
        method: "POST",
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(removeFromGroupData)
      });

      const responseData:FilearchAPIResponse<string> = await removeFromGroupResponse.json();
      return responseData.action_responses;
  } catch (error) {
    logger.error("Error removing users from group: " + error);
    return [
      {
        type:ResourceType.GROUP,
        action:ActionType.REMOVE_USER_FROM_GROUP,
        data:null,
        errors:[
          {
            error_code:7001,
            error_message:"Error removing users from group. See logs for details.",
            http_code:500
          }
        ]
      }
    ];
  }
}

export async function GetGroupPermissions(accessToken: string, groupId:number, userId:number): Promise<FilearchGroupPermission[]> {
  let searchParams : URLSearchParams = new URLSearchParams();
  searchParams.append("user_id", userId.toString());
  
  const permissionURL:string = process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/group/" + groupId + "/permissions" + `?${searchParams.toString()}`;

  try{
    const getPermissionsResponse = await fetch(permissionURL,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }
      });
    
    if (getPermissionsResponse.status !== 200) {
      HandleErrorResponse(await getPermissionsResponse.json());
      return [];
    }

    const permissionData:FilearchAPIResponse<FilearchGroupPermission[]> = await getPermissionsResponse.json();
    if (permissionData.action_responses[0].data === null) {
      logger.error("Data returned null. Should not happen.");
      return [];
    }
    return permissionData.action_responses[0].data;
  } catch (error) {
    logger.error("Error getting permissions " + error);
    return [];
  }
}

export async function GetAllUserPermissionsForGroup(accessToken: string, groupId:number): Promise<FIlearchAllGroupPermission[]> {
  try{
    const getPermissionsResponse = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/group/" + groupId + "/all_user_permissions",
      {
        method: "GET",
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }
      });
    
    if (getPermissionsResponse.status !== 200) {
      HandleErrorResponse(await getPermissionsResponse.json());
      return [];
    }

    const userPermissions:FilearchAPIResponse<FIlearchAllGroupPermission[]> = await getPermissionsResponse.json();
    if (userPermissions.action_responses[0].data === null) {
      logger.error("No data returned. This should not happen.");
      return [];
    }
    return userPermissions.action_responses[0].data;
  } catch (error) {
    logger.error("Error getting permissions for users " + error);
    return [];
  }
}

export async function ModifyPermission(accessToken: string, groupId:number, userId:number, permission:FilearchGroupPermissionType, removePermission:boolean) : Promise<ActionResponse<FilearchGroupPermission>[]> {
  const modifyPermissionData = [{
    action: (removePermission ? "REMOVE" : "ADD"),
    user_id: userId,
    permission: permission
  }];

  try {
    const modifyPermissionResponse = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/group/" + groupId + "/permissions",
      {
        method: "POST",
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(modifyPermissionData)
      }
    );

    const data = await modifyPermissionResponse.json()
    return data.action_responses;
  } catch(error) {
    logger.error("Error modifying user permission: " + error);
    return [];
  }
}

export async function GetPaginatedGroupFiles(
  accessToken: string,
  groupId: number,
  afterId: number|null,
  limit: number) : Promise<PaginationContract<FilearchGroupFile> | null> {
    const data: ActionResponse<PaginationContract<FilearchGroupFile>> = 
      await SinglePaginatedCall<FilearchGroupFile>(
        accessToken,
        process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/group/" + groupId + "/files",
        afterId,
        SortDirection.ASCENDING,
        limit,
        ResourceType.GROUP);
    if (data.errors !== null && data.errors.length > 0) {
      logActionResponseErrors(data);
      return null;
    }
    return data.data;
}

export async function RemoveGroupItem(accessToken:string, groupId:number, itemId:number, itemType:GroupItemType) : Promise<boolean> {
  const bodyData = {remove_items:[{item_id:itemId, item_type:itemType}]};

  try{
    const resp = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/group/" + groupId + "/remove_items",
        {
          method: "POST",
          headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyData)
        }
      );
    
    if (resp.status != 200) {
      HandleErrorResponse(await resp.json());
      return false;
    }

    const respData = await resp.json();
    const ar: ActionResponse<FilearchGroupItem> = respData.action_responses[0];
    if (ar.errors !== null && ar.errors.length > 0) {
      HandleActionResponse(ar);
      return false;
    }

    if (ar.data === null) {
      // This should never happen
      logger.error("No Data returned for group remove item.");
      return false;
    }

    return ar.data.item_id == itemId;
  } catch(error) {
    logger.error("Error removing item from group. " + error);
    return false;
  }
}
