'use server';

import { GetAllFolders } from "@/filearch_api/folder";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function GetAllFoldersAction() {
  logger.debug("Gettting all folders data.");
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.");
    return null;
  }
  return await GetAllFolders(session.access_token);
}