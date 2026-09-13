import logger from "@/lib/logger";
import { ActionResponse, ActionType, FilearchAPI_IdObject, ResourceType, SortDirection } from "./FilearchAPI";
import { GetAllPaginatedData, logActionResponseErrors, MakeAPICall } from "./FilearchAPI_ServerFunctions"
import { group } from "console";

const TAG_LIMIT_PER_REQUEST:number = 1000;
const TAG_SEARCH_LIMIT_DEFAULT:number = 15;

export interface FilearchTag extends FilearchAPI_IdObject {
  owner_id: number;
  tag_name: string;
}

interface TagShareResult {
  tag_id: number;
  group_id: number;
  action_successful: boolean;
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
    return response[0].data;
  }
}

export async function RemoveTagFromFile(accessToken:string, tagId: number, fileId: number): Promise<boolean> {
  const finalUrl: string = process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/file/" + fileId + "/unassign_tag";
  const removeTagData = {
    tag_id: tagId
  };

  const initParams:RequestInit = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
    body: JSON.stringify(removeTagData)
  };

  const response:ActionResponse<boolean>[] = await MakeAPICall<boolean>(finalUrl, initParams, ResourceType.TAG, ActionType.UNASSIGN);
  
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
    return response[0].data;
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

export async function GetAllTagsOnFile(accessToken:string, fileId: number, groupId?:number): Promise<FilearchTag[] | null> {
  let additionalParams :[string, string][]|undefined = undefined;
  if (groupId !== undefined) {
    additionalParams = [["group_id", String(groupId)]];
  }

  return await GetAllPaginatedData(
    accessToken,
    process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/file/" + fileId + "/tags",
    SortDirection.ASCENDING, 
    TAG_LIMIT_PER_REQUEST,
    ResourceType.TAG,
    additionalParams);
}

export async function GetGroupIdsTagIsSharedIn(accessToken:string, tagId:number): Promise<number[]> {
  const finalUrl: string = process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/tag/" + tagId + "/groups_in";

  const initParams:RequestInit = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  };

  const response = await MakeAPICall(finalUrl, initParams, ResourceType.TAG, ActionType.GET);

  if (response.length > 1) {
    logger.warn("There are more than 1 action response objects return. Loss of data can Occur. Please check with Back End.");
  } else if (response.length <= 0) {
    logger.error("No data returned. Please check with Back End.");
    return [];
  }

  const responseAction = response[0];
  if (responseAction.errors !== null && responseAction.errors.length > 0) {
    logger.error("Response contains errors.");
    logActionResponseErrors(response[0]);
    return [];
  } else if (responseAction.data === null) {
    logger.error("Response data is null. URL=" + finalUrl);
    return [];
  } else {
    return responseAction.data as number[];
  }
}

export async function ShareTagWithGroup(accessToken:string, tagId:number, groupId:number): Promise<boolean> {
  const finalURL:string = process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/tag/share"

  const shareTagData = {
    share: [
      {
        tag_id: tagId,
        group_id: groupId
      }
    ]
  };

  const initParams:RequestInit = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
    body: JSON.stringify(shareTagData)
  };

  const response : ActionResponse<TagShareResult>[] = await MakeAPICall<TagShareResult>(finalURL, initParams, ResourceType.TAG, ActionType.SHARE_TAG);

  if (response.length > 1) {
    logger.warn("There are more than 1 action response objects return. Loss of data can Occur. Please check with Back End.");
  } else if (response.length <= 0) {
    logger.error("No data returned. Please check with Back End.");
    return false;
  }

  const responseAction = response[0];
  if (responseAction.errors !== null && responseAction.errors.length > 0) {
    logger.error("Response contains errors.");
    logActionResponseErrors(response[0]);
    return false;
  } else if (responseAction.data === null) {
    logger.error("Response data is null. URL=" + finalURL);
    return false;
  } else {
    const tagShare:TagShareResult = responseAction.data;
    if (tagShare.tag_id !== tagId) {
      logger.error("Response tag ID doesn't match.");
      return false;
    } else if (tagShare.group_id !== groupId) {
      logger.error("Response group ID doesn't match.");
      return false;
    } else {
      return tagShare.action_successful;
    }
  }
}

export async function UnshareTagWithGroup(accessToken:string, tagId:number, groupId:number): Promise<boolean> {
  const finalURL:string = process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/tag/unshare"

  const shareTagData = {
    share: [
      {
        tag_id: tagId,
        group_id: groupId
      }
    ]
  };

  const initParams:RequestInit = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
    body: JSON.stringify(shareTagData)
  };

  const response : ActionResponse<TagShareResult>[] = await MakeAPICall<TagShareResult>(finalURL, initParams, ResourceType.TAG, ActionType.SHARE_TAG);

  if (response.length > 1) {
    logger.warn("There are more than 1 action response objects return. Loss of data can Occur. Please check with Back End.");
  } else if (response.length <= 0) {
    logger.error("No data returned. Please check with Back End.");
    return false;
  }

  const responseAction = response[0];
  if (responseAction.errors !== null && responseAction.errors.length > 0) {
    logger.error("Response contains errors.");
    logActionResponseErrors(response[0]);
    return false;
  } else if (responseAction.data === null) {
    logger.error("Response data is null. URL=" + finalURL);
    return false;
  } else {
    const tagShare:TagShareResult = responseAction.data;
    if (tagShare.tag_id !== tagId) {
      logger.error("Response tag ID doesn't match.");
      return false;
    } else if (tagShare.group_id !== groupId) {
      logger.error("Response group ID doesn't match.");
      return false;
    } else {
      return tagShare.action_successful;
    }
  }
}
