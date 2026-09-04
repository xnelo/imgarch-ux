import logger from "@/lib/logger";
import { ActionResponse, FilearchAPIResponse, FilearchFile, PaginationContract, ResourceType, SortDirection, StorageType } from "./FilearchAPI";
import { logActionResponseErrors, MakeAPICall, SinglePaginatedCall } from "./FilearchAPI_ServerFunctions";
import { group } from "console";

export async function GetPaginatedSearchFiles(
  accessToken:string, 
  searchTerm: string,
  afterId:number|null,
  limit:number): Promise<PaginationContract<FilearchFile> | null> {

  const additionalParams: [string, string][] = [["search_term", searchTerm]];

  const data: ActionResponse<PaginationContract<FilearchFile>> = 
    await SinglePaginatedCall<FilearchFile>(
      accessToken,
      process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/file/search",
      afterId,
      SortDirection.ASCENDING,
      limit,
      ResourceType.FILE,
      additionalParams);
  if (data.errors !== null && data.errors.length > 0) {
    logActionResponseErrors(data);
    return null;
  }
  return data.data;
}

export async function GetPaginatedAllFiles(
  accessToken:string,
  afterId:number|null,
  limit:number): Promise<PaginationContract<FilearchFile> | null> {
    const data: ActionResponse<PaginationContract<FilearchFile>> = 
      await SinglePaginatedCall<FilearchFile>(
        accessToken,
        process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/file",
        afterId,
        SortDirection.ASCENDING,
        limit,
        ResourceType.FILE);
    
    if (data.errors !== null && data.errors.length > 0) {
      logActionResponseErrors(data);
      return null;
    }
    return data.data;
  }

export async function GetPaginatedFiles(
    accessToken:string, 
    folderId:number, 
    afterId:number|null,
    limit:number): Promise<PaginationContract<FilearchFile> | null> {
  const data: ActionResponse<PaginationContract<FilearchFile>> = 
    await SinglePaginatedCall<FilearchFile>(
      accessToken,
      process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/folder/" + folderId + "/files",
      afterId,
      SortDirection.ASCENDING,
      limit,
      ResourceType.FILE);
  if (data.errors !== null && data.errors.length > 0) {
    logActionResponseErrors(data);
    return null;
  }
  return data.data;
}

export async function GetFileDownload(fileId: number, accessToken: string, groupId?: number): Promise<Uint8Array<ArrayBuffer> | null> {
  let downloadUrl : string = process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/file/" + fileId + "/download";
  if (groupId !== undefined) {
    downloadUrl += "?group_id=" + groupId;
  }

  const response = await fetch(downloadUrl,
    {
      method: 'GET',
      headers: {
        'accept': 'application/octet-stream',
        'Authorization': 'Bearer ' + accessToken
      }
    });
  if (response.status == 200) {
    const data : ArrayBuffer = await response.arrayBuffer();
    return new Uint8Array<ArrayBuffer>(data);
  } else {
    logger.error("Error downloading file: status=" + response.status);
    return null;
  }
}

export async function GetThumbnailDownload(fileId: number, accessToken: string, groupId?:number): Promise<Uint8Array<ArrayBuffer>|null> {
  let thumbnailUrl = process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/file/" + fileId + "/download_thumbnail";
  if (groupId !== undefined) {
    thumbnailUrl += "?group_id=" + groupId;
  }

  const response = await fetch(thumbnailUrl,
    {
      method: 'GET',
      headers: {
        'accept': 'application/octet-stream',
        'Authorization': 'Bearer ' + accessToken
      }
    });
  if (response.status == 200) {
    const data : ArrayBuffer = await response.arrayBuffer();
    return new Uint8Array<ArrayBuffer>(data);
  } else {
    const errMsg = await response.text();
    logger.error("Error downloading file thumbnail: status=" + response.status + " msg=" + errMsg);
    return null;
  }
}

export async function UploadFile(formData: FormData, accessToken: string) : Promise<FilearchAPIResponse<FilearchFile> | null> {
  const response = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/file",
    {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      },
      body: formData
    });
  if (response.status == 200) {
    const data = await response.json();
    return data;
  } else { 
    try {
      const errorData = await response.json();
      return errorData;
    } catch (e) {
      logger.error("Getting error data: " + e);
      return null;
    }
  }
}

export async function DeleteFile(fileId: number, accessToken: string) : Promise<ActionResponse<FilearchFile> | null> {
  const response = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/file/" + fileId, 
    {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      }
    });
  if (response.status == 200) {
    const data : FilearchAPIResponse<FilearchFile> = await response.json();
    return data.action_responses[0];
  } else {
    try {
      const errorData : FilearchAPIResponse<FilearchFile> = await response.json();
      return errorData.action_responses[0];
    } catch(e) {
      logger.error("Error Deleting file: " + e);
      return null;
    }
  }
}