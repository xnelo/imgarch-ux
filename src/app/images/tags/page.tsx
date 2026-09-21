import { FilearchTag, GetAllTags } from "@/filearch_api/tag";
import { getSession } from "@/lib/lib";

export default async function TagsPage() {
  const session = await getSession();

  if (session.access_token === undefined) {
    return (
      <main>
        <h1>Unable to get session. Please login or contact support.</h1>
      </main>
    );
  }

  const tags: FilearchTag[] | null = await GetAllTags(session.access_token);

  return (
          <main>
              <h1>Tag Management</h1>
              <ul>
                {tags?.map(t=><li key={t.id}><a href={`/images/tags/${t.id}/`}>{t.tag_name}({t.id})</a></li>)}
              </ul>
          </main>
      );
 }