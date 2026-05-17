import { getSession } from '@/lib/lib';
import logger from '@/lib/logger';
import { GetAllFolders } from '@/filearch_api/folder';
import FolderView from '@/components/folder/FolderView';
import { GetGroupsIn } from '@/filearch_api/group';

export default async function FolderPage() {
    const session = await getSession();
    logger.debug(JSON.stringify(session, null, 2));
    
    if (session?.access_token === undefined) {
        logger.error("Access Token is null");
        return (
            <main>
                <div>
                    UNEXPECTED ERROR PLEASE REPORT ISSUE!
                </div>
            </main>
        );
    } 
    const folders = GetAllFolders(session.access_token);
    const groups = GetGroupsIn(session.access_token);

    return (
        <main>
            <FolderView folders={folders} groups={groups}/>
        </main>
    )
}