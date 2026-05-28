import logger from "@/lib/logger";
import { ActionResponse, ActionType, FilearchAPIResponse, FilearchGroup, HandleErrorResponse, ResourceType, SortDirection } from "./FilearchAPI";
import { GetAllPaginatedData } from "./FilearchAPI_ServerFunctions";
import { group } from "console";

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