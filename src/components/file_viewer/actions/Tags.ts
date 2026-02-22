'use server'

import { FilearchTag, GetAllTagsOnFile } from "@/filearch_api/tag";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function GetTagsForFile(fileId: number): Promise<FilearchTag[] | null> {
  logger.debug("Getting tags for file_id=" + fileId);
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.");
    return null;
  }
  return await GetAllTagsOnFile(session.access_token, fileId);
}