import { FilearchTag, GetAllTags } from "@/filearch_api/tag";
import { getSession } from "@/lib/lib";
import styles from "./Tags.module.css";
import DeleteTagButton from "@/components/tag_management/DeleteTagButton";
import AllTagsTable from "@/components/tag_management/AllTagsTable";

export default async function TagsPage() {
  const session = await getSession();

  if (session.access_token === undefined) {
    return (
      <main>
        <h1>Unable to get session. Please login or contact support.</h1>
      </main>
    );
  }

  const tags: Promise<FilearchTag[] | null> = GetAllTags(session.access_token);

  return (
          <main>
            <div className={`container ${styles.TagManagementContainer}`}>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item"><a href="/images/">Home</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Tags</li>
                </ol>
              </nav>
              <h1>Tag Management</h1>
              <div className={styles.TagManagement_Tags}>
                <AllTagsTable allTags={tags}/>
              </div>
            </div>
          </main>
      );
 }