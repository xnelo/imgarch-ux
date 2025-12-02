'use server';

import { GetFileDownload, GetThumbnailDownload } from "@/filearch_api/files";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function DownloadImage(fileId: number): Promise<Uint8Array<ArrayBuffer>|null> {
  logger.debug("Getting file image for file_id=" + fileId);
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API.");
    return null;
  }
  return await GetFileDownload(fileId, session.access_token);
}

export async function DownloadThumbnail(fileId: number) : Promise<Uint8Array<ArrayBuffer>|null> {
  logger.debug("Getting thumbnail for file_id=" + fileId);
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. cannot call API.");
    return null;
  }
  return await GetThumbnailDownload(fileId, session.access_token);
}