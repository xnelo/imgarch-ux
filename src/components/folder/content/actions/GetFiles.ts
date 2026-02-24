'use server'

import { PaginationContract } from "@/filearch_api/FilearchAPI";
import { FilearchFile, GetPaginatedFiles } from "@/filearch_api/files";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function GetFiles(
  folderId: number, 
  afterId:number|null) : Promise<PaginationContract<FilearchFile>|null> {
    
  logger.debug("Getting files for folder_id=" + folderId);
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.");
    return null;
  }
  return await GetPaginatedFiles(session.access_token, folderId, afterId, 20);
}