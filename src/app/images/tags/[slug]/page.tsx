import TagGroupView from "@/components/tag_groups/TagGroupView";
import { FilearchGroup } from "@/filearch_api/FilearchAPI";
import { GetGroupsIn } from "@/filearch_api/group";
import { FilearchTag, GetGroupIdsTagIsSharedIn, GetTagInfo } from "@/filearch_api/tag";
import { getSession } from "@/lib/lib";

export default async function TagDetailPage({params,}: {params: Promise<{ slug: number }>;}) {
  const { slug } = await params;

  const session = await getSession();
  
  if (session.access_token === undefined) {
    return (
      <main>
        <h1>Unable to get session. Please login or contact support.</h1>
      </main>
    );
  }

  const tagInfo:FilearchTag|null = await GetTagInfo(session.access_token, slug);

  if (tagInfo === null || tagInfo === undefined) {
    return (
      <main>
        <h1>Error retrieving tag info.</h1>
      </main>
    );
  }

  const groupsUserIn:Promise<FilearchGroup[] | null> = GetGroupsIn(session.access_token);
  const groupsTagIn:Promise<number[]> = GetGroupIdsTagIsSharedIn(session.access_token, slug);

  return (
    <main>
      
      <div className="container" style={{background:"var(--bs-light)", paddingBottom:"12px", paddingTop:"12px"}}>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/images/">Home</a></li>
            <li className="breadcrumb-item"><a href="/images/tags">Tags</a></li>
            <li className="breadcrumb-item active" aria-current="page">{tagInfo.tag_name} ({slug})</li>
          </ol>
        </nav>

        <div>
          <h1>Tag Detials: {tagInfo.tag_name}</h1>
          <div style={{paddingLeft:'10px'}}>
            <span>id: {tagInfo.id}</span>
          </div>
        </div>

        <TagGroupView tagId={tagInfo.id} groupsUserIn={groupsUserIn} idOfGroupsTagIn={groupsTagIn}/>
      </div>
    </main>
  );
}