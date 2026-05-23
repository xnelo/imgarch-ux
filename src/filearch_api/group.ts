import logger from "@/lib/logger";
import { ActionResponse, FilearchGroup, HandleErrorResponse, ResourceType, SortDirection } from "./FilearchAPI";
import { GetAllPaginatedData } from "./FilearchAPI_ServerFunctions";

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