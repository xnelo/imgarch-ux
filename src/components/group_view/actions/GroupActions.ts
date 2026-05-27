'use server'

import { CreateNewGroup, DeleteGroup } from "@/filearch_api/group";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function CreateGroup(group_name: string) {
  logger.debug("Adding group with name " + group_name);

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return null;
  }
  
  return await CreateNewGroup(session.access_token, group_name);
}

export async function DeleteGroupAction(groupId: number) {
  logger.debug("Deleting group with id: " + groupId);

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return null;
  }

  return await DeleteGroup(session.access_token, groupId);
}