'use server'

import { DeleteTag as APIDeletTag } from "@/filearch_api/tag";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function DeleteTag(tagId:number):Promise<boolean> {
  logger.debug("Deleting tag(" + tagId + ")");
  
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return false;
  }

  return await APIDeletTag(session.access_token, tagId);
}