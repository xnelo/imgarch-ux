'use client'

import { FolderItem } from "../FolderItem";
import { Button } from "react-bootstrap";
import { UploadImage } from "./actions/UploadFiles";
import { ActionResponse, ErrorResponse, FilearchAPIResponse, PaginationContract } from "@/filearch_api/FilearchAPI";
import { FilearchFile } from "@/filearch_api/files";
import toast from "react-hot-toast";
import FilesViewer from "@/components/file_viewer/FilesViewer";
import { useEffect, useState } from "react";
import { GetFiles } from "@/components/folder/content/actions/GetFiles";

export default function FolderContentView({ selectedFolderItem }: { selectedFolderItem: FolderItem | undefined }) {
  const addFiles = async () => {
    document.getElementById("fileOpenElement")?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles !== null && selectedFiles?.length > 0 && selectedFolderItem !== undefined) {
      const toSend = new FormData();
      for (let i = 0; i < selectedFiles.length; ++i) {
        toSend.append("files", selectedFiles[i], selectedFiles[i].name);
      }
      toSend.append("folderId", "" + selectedFolderItem.id);
      let res: FilearchAPIResponse<FilearchFile> | null = await UploadImage(toSend);
      if (res === null) {
        toast.error("Error uploading file. No data returned.");
        return;
      }

      for (let i = 0; i < res.action_responses.length; ++i) {
        let ar: ActionResponse<FilearchFile> = res.action_responses[i];
        if (ar.errors !== null && ar.errors.length > 0) {
          for (let j = 0; j < ar.errors.length; ++j) {
            let error: ErrorResponse = ar.errors[j];
            toast.error("Error uploading file: '" + error.error_message + "' error_code:" + error.error_code);
          }
        } else {
          // No errors
          let addedFile: FilearchFile | null = ar.data;
          if (addedFile === null) {
            // This should never happen
            toast.error("No file data returned with success. Contact support.");
          } else {
            toast.success("File added: " + addedFile.original_filename + "(" + addedFile.id + ")");
          }
        }
      }
      setRefreshTrigger(prev => prev + 1);
    }
  };

  async function getFiles_Internal(afterId: number | null): Promise<PaginationContract<FilearchFile> | null> {
    if (selectedFolderItem === undefined) {
      return null;
    } else {
      return await GetFiles(selectedFolderItem.id, afterId);
    }
  }

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    setRefreshTrigger(prev => prev + 1);
  }, [selectedFolderItem]);

  return (

    <div>
      <h2 style={{
        borderBottom: 'var(--bs-border-color) 1px solid',
        padding: '0.5rem'
      }}>Folder: {selectedFolderItem?.name}</h2>
      <FilesViewer 
        getFileFunction={getFiles_Internal} 
        refreshTrigger={refreshTrigger}
        style={{
          position: 'absolute',
          height: 'calc(100vh - 12.75rem)',
          width: 'calc(75vw - 0.5rem)',
          left: '0.5rem'
        }}/>
      <Button disabled={selectedFolderItem === undefined} onClick={addFiles} style={{ position: "absolute", top: "calc(100vh - 13rem)", left: "calc(75vw - 6rem)", borderRadius: "30px", padding: "11px 16px", border: "solid 1px var(--bs-secondary)" }}>
        <i className="bi bi-plus-lg"></i>
      </Button>
      <input type="file" id="fileOpenElement" onChange={handleFileChange} style={{ display: "none" }} />
      <div style={{
        position: 'absolute',
        borderTop: 'var(--bs-border-color) 1px solid',
        top: 'calc(100vh - 8.5rem)',
        width: '75vw',
        paddingTop: '.5rem'
      }}>
      </div>
    </div>
  );
}