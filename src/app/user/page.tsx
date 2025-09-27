import { getSession } from '@/lib/lib';
import logger from '@/lib/logger';
import { GetAllFolders } from '@/filearch_api/folder';
import FolderView from '@/components/folder/FolderView';

export default async function UserPage() {
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
    

    return (
        <main>
            <FolderView folders={folders}/>
        </main>
    )
}