'use server';

import { FilearchAPIResponse } from "@/filearch_api/FilearchAPI";
import { FilearchFile, UploadFile } from "@/filearch_api/files";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function UploadImage(formData:FormData) : Promise<FilearchAPIResponse<FilearchFile> | null> {
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Access token is 'undefined'. Cannot call API");
    return null;
  }
  return await UploadFile(formData, session.access_token);
}