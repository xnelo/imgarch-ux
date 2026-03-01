'use server'

import { PaginationContract } from "@/filearch_api/FilearchAPI";
import { FilearchFile, GetPaginatedSearchFiles } from "@/filearch_api/files";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function SearchFiles(searchTerm: string, afterId: number|null): Promise<PaginationContract<FilearchFile> | null> {
  logger.debug("Searching files with term: " + searchTerm + " afterId: " + afterId);
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.");
    return null;
  }
  return await GetPaginatedSearchFiles(session.access_token, searchTerm, afterId, 20);
}