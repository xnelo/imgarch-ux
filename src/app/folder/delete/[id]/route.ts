import { DeleteFolder } from "@/filearch_api/folder";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function DELETE(request: Request, { params }:{ params: Promise<{id:number}> }) {
    const {id} = await params;
    logger.debug("Deleting folder id=%d", id);

    const session = await getSession();
    if (session.access_token === undefined) {
        logger.error("Error getting access token for delete folder.");
        return null;
    }

    const deleteFolderResponse = await DeleteFolder(session.access_token, id);
    return Response.json(deleteFolderResponse);
}