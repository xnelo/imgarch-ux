import FileViewer from "@/components/file_viewer/FileViewer";
import styles from "../../common.module.css";
import { ActionResponse, FilearchFile } from "@/filearch_api/FilearchAPI";
import { GetFileInfo } from "@/filearch_api/files";
import { getSession } from "@/lib/lib";

export default async function ImageDetailPage({params,}: {params: Promise<{ slug: number }>;}) {
  const { slug } = await params;

  const session = await getSession();
  
  if (session.access_token === undefined) {
    return (
      <main>
        <h1>Unable to get session. Please login or contact support.</h1>
      </main>
    );
  }

  const fileData:ActionResponse<FilearchFile> = await GetFileInfo(session.access_token, slug);

  if (fileData.errors !== null && fileData.errors.length > 0) {
    return (
      <main>
        <h1>Error retrieving image information for image id={slug}</h1>
        <ul>
          {fileData.errors.map(err=><li key={err.error_code}><span>({err.http_code})</span> {err.error_message} <span>[{err.error_code}]</span></li>)}
        </ul>
      </main>
    );
  }

  if (fileData.data === null){
    return (
      <main>
        <h1>No data returned from server for image id={slug}</h1>
      </main>
    );
  }

  return (
    <main>
      <div className={`container ${styles.MainContainer}`}>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/main/">Home</a></li>
            <li className="breadcrumb-item"><a href="/main/images/">Images</a></li>
            <li className="breadcrumb-item active" aria-current="page">{slug}</li>
          </ol>
        </nav>
        <h1>{fileData.data.original_filename}</h1>
        <FileViewer fileData={fileData.data} height='calc(80vh - 8px)'/>
      </div>
    </main>
  );
}