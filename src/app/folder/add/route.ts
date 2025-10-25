import { NextRequest } from "next/server";
import logger from "@/lib/logger";
import { AddFolder } from "@/filearch_api/folder";
import { getSession } from "@/lib/lib";

export async function POST(request: NextRequest) {
    const newFolderData = await request.json();
    logger.debug("Adding folder {}", newFolderData);

    const session = await getSession();
    if (session.access_token === undefined) {
        logger.error("Error getting access token for session.");
        return null;
    }

    const newFolderResponse = await AddFolder(session.access_token, newFolderData);
    return Response.json(newFolderResponse);
}