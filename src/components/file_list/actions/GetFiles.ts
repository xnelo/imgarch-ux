'use server';

import { FilearchFile, PaginationContract } from "@/filearch_api/FilearchAPI";
import { GetPaginatedAllFiles } from "@/filearch_api/files";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function GetAllFiles( 
  afterId:number|null) : Promise<PaginationContract<FilearchFile>|null> {
    
  logger.debug("Getting all files for");
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.");
    return null;
  }
  return await GetPaginatedAllFiles(session.access_token, afterId, 20);
}