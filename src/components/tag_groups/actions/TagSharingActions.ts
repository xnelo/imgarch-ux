'use server'

import {
  ShareTagWithGroup as APIShareTagWithGroup,
  UnshareTagWithGroup as APIUnshareTagWithGroup
} from "@/filearch_api/tag";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function ShareTagWithGroup(tagId:number, groupId:number):Promise<boolean> {
  logger.debug("Sharing tag(" + tagId + ") with group("+ groupId + ")");

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return false;
  }

  return await APIShareTagWithGroup(session.access_token, tagId, groupId);
}

export async function UnShareTagWithGroup(tagId:number, groupId:number) : Promise<boolean> {
  logger.debug("Unsharing tag(" + tagId + ") from group("+ groupId + ")");

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return false;
  }

  return await APIUnshareTagWithGroup(session.access_token, tagId, groupId);
}