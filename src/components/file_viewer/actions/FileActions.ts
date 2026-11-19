'use server';

import { ActionResponse } from "@/filearch_api/FilearchAPI";
import { GetFolderPath as APIGetFolderPath } from "@/filearch_api/files";
import { FilearchFolder } from "@/filearch_api/folder";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function GetFolderPath(fileId:number) : Promise<ActionResponse<FilearchFolder[]> | null> {
  logger.debug("Getting foler path for fileId=" + fileId);
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.");
    return null;
  }
  return await APIGetFolderPath(session.access_token, fileId);
}