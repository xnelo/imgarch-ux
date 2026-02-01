import logger from "@/lib/logger";
import { ActionResponse, ActionType, FilearchAPI_IdObject, ResourceType, SortDirection } from "./FilearchAPI";
import { GetAllPaginatedData, logActionResponseErrors, MakeAPICall } from "./FilearchAPI_ServerFunctions"

const TAG_LIMIT_PER_REQUEST:number = 1000;
const TAG_SEARCH_LIMIT_DEFAULT:number = 15;

export interface FilearchTag extends FilearchAPI_IdObject {
  owner_id: number;
  tag_name: string;
}

export async function SearchTags(accessToken:string, searchVal:string): Promise<FilearchTag[] | null> {
  // create the final URL with queryparams
  let searchParams : URLSearchParams = new URLSearchParams();
  searchParams.append('limit', TAG_SEARCH_LIMIT_DEFAULT.toString());
  searchParams.append('search_text', searchVal);
  const finalURL:string = process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/tag/search" + `?${searchParams.toString()}`;

  const initParams:RequestInit = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  };

  const response:ActionResponse<FilearchTag[]>[] = await MakeAPICall<FilearchTag[]>(finalURL, initParams, ResourceType.TAG, ActionType.SEARCH);
  
  if (response[0].errors !== null && response[0].errors.length > 0) {
    // Log errors and return null
    logger.error("Response contains errors.");
    logActionResponseErrors(response[0]);
    return null;
  } else if (response[0].data === null) {
    // this should not happen
    // log error and return null
    logger.error("Response data NULL url=" + finalURL);
    return null;
  } else {
    return response[0].data;
  }
}

export async function AddNewTag(accessToken:string, tagName: string): Promise<FilearchTag | null> {
  const newTagData = {
    tag_name: tagName
  };

  const finalUrl: string = process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/tag";

  const initParams:RequestInit = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
    body: JSON.stringify(newTagData)
  };

  const response:ActionResponse<FilearchTag>[] = await MakeAPICall<FilearchTag>(finalUrl, initParams, ResourceType.TAG, ActionType.CREATE);

  if (response[0].errors !== null && response[0].errors.length > 0) {
    // Log errors and return null
    logger.error("Response contains errors.");
    logActionResponseErrors(response[0]);
    return null;
  } else if (response[0].data === null) {
    // this should not happen
    // log error and return null
    logger.error("Response data NULL url=" + finalUrl);
    return null;
  } else {
    return response[0].data;
  }
}

export async function AddTagToFile(accessToken:string, tagId: number, fileId: number): Promise<boolean> {
  const finalUrl: string = process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/file/" + fileId + "/assign_tag";
  const assignTagData = {
    tag_id: tagId
  };

  const initParams:RequestInit = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
    body: JSON.stringify(assignTagData)
  };

  const response:ActionResponse<boolean>[] = await MakeAPICall<boolean>(finalUrl, initParams, ResourceType.TAG, ActionType.ASSIGN);
  
  if (response[0].errors !== null && response[0].errors.length > 0) {
    // Log errors and return false
    logger.error("Response contains errors.");
    logActionResponseErrors(response[0]);
    return false;
  } else if (response[0].data === null) {
    // this should not happen
    // log error and return false
    logger.error("Response data NULL url=" + finalUrl);
    return false;
  } else {
    return true;
  }
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
