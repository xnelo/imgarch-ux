import logger from "@/lib/logger";
import { ActionResponse, ActionType, FilearchAPI_IdObject, FilearchAPIResponse, PaginationContract, ResourceType, SortDirection, StorageType } from "./FilearchAPI";
import { logActionResponseErrors, MakeAPICall, SinglePaginatedCall } from "./FilearchAPI_ServerFunctions";

export interface FilearchFile extends FilearchAPI_IdObject {
  owner_id: number;
  folder_id: number;
  storage_type: StorageType;
  storage_key: string;
  original_filename: string
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

export async function GetFileDownload(fileId: number, accessToken: string): Promise<Uint8Array<ArrayBuffer> | null> {
  const response = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/file/" + fileId + "/download",
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

export async function GetThumbnailDownload(fileId: number, accessToken: string): Promise<Uint8Array<ArrayBuffer>|null> {
  const response = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/file/" + fileId + "/download_thumbnail",
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