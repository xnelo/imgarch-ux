'use server'

import { ActionResponse } from "@/filearch_api/FilearchAPI";
import { DeleteFile, FilearchFile } from "@/filearch_api/files";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function DeleteFileAction(fileId:number): Promise<ActionResponse<FilearchFile> | null> {
  logger.debug("Deleting file_id=" + fileId);
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.")
    return null;
  }
  return await DeleteFile(fileId, session.access_token);
}