'use server';

import { GroupItemType } from "@/filearch_api/FilearchAPI";
import { RemoveGroupItem } from "@/filearch_api/group";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function RemoveItemFromGroupAction(groupId:number, itemId: number, itemType:GroupItemType): Promise<boolean> {
  logger.debug("Removing item from group. group_id=" + groupId + " item_id=" + itemId + " item_type=" + itemType);
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.");
    return false;
  }
  return await RemoveGroupItem(session.access_token, groupId, itemId, itemType);
}