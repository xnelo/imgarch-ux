import GroupView from "@/components/group_view/GroupView";
import { GetGroupsIn } from "@/filearch_api/group";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export default async function GroupsPage() {
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
    const groups = GetGroupsIn(session.access_token);

    return (
        <main>
          <GroupView groups={groups}/>
        </main>
    )
}