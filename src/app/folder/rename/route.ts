import { RenameFolder } from "@/filearch_api/folder";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const renameFolderData = await request.json();
    logger.debug("Renaming folder {}", renameFolderData);

    const session = await getSession();
    if (session.access_token === undefined) {
        logger.error("Error getting access token for session.");
        return null;
    }

    const renameFolderResponse = await RenameFolder(session.access_token, renameFolderData.id, {folder_name:renameFolderData.folder_name})
    return Response.json(renameFolderResponse);
}