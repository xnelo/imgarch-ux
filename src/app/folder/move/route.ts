import { MoveFolder } from "@/filearch_api/folder";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const moveFolderData = await request.json();
  logger.debug("Moving Folder {}", moveFolderData);

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return null;
  }

  const moveFolderResponse = await MoveFolder(session.access_token, moveFolderData.id, moveFolderData.new_parent_id);
  return Response.json(moveFolderResponse);
}