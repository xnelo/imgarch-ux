'use server'

import {
  SearchTags as APISearchTags,
  AddNewTag as APIAddNewTag,
  AddTagToFile as APIAddTagToFile,
  RemoveTagFromFile as APIRemoveTagFromFile,
  GetGroupIdsTagIsSharedIn as APIGetGroupIdsTagIsSharedIn,
  ShareTagWithGroup as APIShareTagWithGroup,
  UnshareTagWithGroup as APIUnshareTagWithGroup
} from "@/filearch_api/tag";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function SearchTags(searchVal: string) {
  logger.debug("Searching Tags search val=" + searchVal);
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.");
    return null;
  }
  return await APISearchTags(session.access_token, searchVal);
}

export async function AddNewTag(tagName: string) {
  logger.debug("Adding new tag: " + tagName);
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.");
    return null;
  }
  return await APIAddNewTag(session.access_token, tagName);
}

export async function AddTagToFile(tagId: number, fileId: number, groupId:number|undefined) {
  logger.debug("Adding tag to file: tagId=" + tagId + ", fileId=" + fileId + (groupId !== undefined ? ", group_id=" + groupId : ""));
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.");
    return false;
  }
  return await APIAddTagToFile(session.access_token, tagId, fileId, groupId);
}

export async function RemoveTagFromFile(tagId: number, fileId: number, groupId:number|undefined) {
  logger.debug("Removing tag from file: tagId=" + tagId + ", fileId=" + fileId + (groupId !== undefined ? ", group_id=" + groupId : ""));
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.");
    return false;
  }
  return await APIRemoveTagFromFile(session.access_token, tagId, fileId, groupId);
}

export async function GetGroupIdsTagIsSharedIn(tagId: number): Promise<number[]> {
  logger.debug("Getting groups tags are shared in.");
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.");
    return [];
  }
  return await APIGetGroupIdsTagIsSharedIn(session.access_token, tagId);
}

export async function ShareTagWithGroup(tagId: number, groupId: number): Promise<boolean> {
  logger.debug("Sharing tag(" + tagId + ") with group(" + groupId +").");
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.");
    return false;
  }
  return await APIShareTagWithGroup(session.access_token, tagId, groupId);
}

export async function UnshareTagWithGroup(tagId: number, groupId: number): Promise<boolean> {
  logger.debug("Unsharing tag(" + tagId + ") with group(" + groupId +").");
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.");
    return false;
  }
  return await APIUnshareTagWithGroup(session.access_token, tagId, groupId);
}