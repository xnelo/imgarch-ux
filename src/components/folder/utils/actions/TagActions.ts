'use server'

import { SearchTags as APISearchTags, AddNewTag as APIAddNewTag, AddTagToFile as APIAddTagToFile } from "@/filearch_api/tag";
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

export async function AddTagToFile(tagId: number, fileId: number) {
  logger.debug("Adding tag to file: tagId=" + tagId + ", fileId=" + fileId);
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.");
    return false;
  }
  return await APIAddTagToFile(session.access_token, tagId, fileId);
}