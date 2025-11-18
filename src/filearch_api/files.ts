import { ActionResponse, FilearchAPI_IdObject, PaginationContract, ResourceType, SortDirection, StorageType } from "./FilearchAPI";
import { logActionResponseErrors, SinglePaginatedCall } from "./FilearchAPI_ServerFunctions";

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