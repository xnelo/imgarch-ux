import styles from "../common.module.css";
import { FilearchAPI_IdObject, FilearchFile } from "@/filearch_api/FilearchAPI";
import { GetAllUserFiles } from "@/filearch_api/files";
import { getSession } from "@/lib/lib";
import { Suspense } from "react";

export default async function MainPage() {
  const session = await getSession();
  
  if (session.access_token === undefined) {
    return (
      <main>
        <h1>Unable to get session. Please login or contact support.</h1>
      </main>
    );
  }

  const files: FilearchFile[] | null = await GetAllUserFiles(session.access_token, 20);
    
  return (
    <main>
      <div className={`container ${styles.MainContainer}`}>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/main/">Home</a></li>
            <li className="breadcrumb-item active" aria-current="page">Images</li>
          </ol>
        </nav>
        <h1>Images Page</h1>
        <Suspense fallback={<p>loading files</p>}>
          <ul>
            {files?.map(file=><li key={file.id}><a href={`/main/images/${file.id}/`}>{file.original_filename}</a></li>)}
          </ul>
        </Suspense>
      </div>
    </main>
  );
}