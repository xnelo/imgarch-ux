import Login from '@/components/Login';
import FolderView from '@/components/folder_view/FolderView';
import { Suspense } from 'react';
import { getSession } from '@/lib/lib';
import logger from '@/lib/logger';
import { GetAllFolders } from '@/filearch_api/folder';

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
            <div className='container-fluid'>
                <div 
                    className='position-absolute overflow-y-scroll bg-body-tertiary' 
                    style={{
                        width: 'calc(25vw - 2rem)',
                        height: 'calc(100vh - 7.75rem)',
                        margin: '1rem',
                        left: '0px',
                        borderRight: 'var(--bs-border-color) 1px solid'
                        }}>
                    <Suspense fallback={<div>Loading...</div>}>
                        <FolderView folders={folders}/>
                    </Suspense>
                </div>
                <div 
                    className='position-absolute overflow-y-scroll' 
                    style={{
                        backgroundColor: 'red',
                        width: 'calc(75vw - 2rem)',
                        height: 'calc(100vh - 7.75rem)',
                        margin: '1rem',
                        left: '25vw'
                        }}>
                    <h2>HELLO CRACKER</h2>
                    <Login />
                </div>
            </div>
        </main>
    )
}