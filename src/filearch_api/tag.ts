import { FilearchAPI_IdObject, ResourceType, SortDirection } from "./FilearchAPI";
import { GetAllPaginatedData } from "./FilearchAPI_ServerFunctions"

const TAG_LIMIT_PER_REQUEST:number = 1000;

export interface FilearchTag extends FilearchAPI_IdObject {
  owner_id: number;
  tag_name: string;
}

export async function GetAllTags(accessToken:string): Promise<FilearchTag[] | null> {
  return await GetAllPaginatedData(
    accessToken,
    process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/tag",
    SortDirection.ASCENDING, 
    TAG_LIMIT_PER_REQUEST,
    ResourceType.TAG);
}

export async function GetAllTagsOnFile(accessToken:string, fileId: number): Promise<FilearchTag[] | null> {
  return await GetAllPaginatedData(
    accessToken,
    process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/file/" + fileId + "/tags",
    SortDirection.ASCENDING, 
    TAG_LIMIT_PER_REQUEST,
    ResourceType.TAG);
}
