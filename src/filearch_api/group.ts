import { FilearchGroup, ResourceType, SortDirection } from "./FilearchAPI";
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