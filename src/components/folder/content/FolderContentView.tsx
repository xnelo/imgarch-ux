'use client'

import { useEffect, useState } from "react";
import { FolderItem } from "../FolderItem";
import { GetFiles } from "./actions/GetFiles";
import { FileItem } from "./FileItem";
import { useInView } from "react-intersection-observer";
import FileItemView from "./FileItemView";
import { Button } from "react-bootstrap";
import { UploadImage } from "./actions/UploadFiles";
import { ActionResponse, ErrorResponse, FilearchAPIResponse } from "@/filearch_api/FilearchAPI";
import { FilearchFile } from "@/filearch_api/files";
import toast from "react-hot-toast";

function removeFile(currData: FileItem[], deletedId:number) : FileItem[] {
  const newArray:FileItem[] = [];

  for(const item of currData) {
    if (item.id === deletedId) {
      continue;
    } else {
      newArray.push(item);
    }
  }

  return newArray;
}

export default function FolderContentView({selectedFolderItem}:{selectedFolderItem:FolderItem | undefined}) {
    
    const [data,setData] = useState<FileItem[]>([]);
    const [moreToLoad, setMoreToLoad] = useState<boolean>(true);
    const [lastListItemId, setLastListItemId] = useState<number|null>(null);
    const { ref, inView } = useInView();

    const addFiles = async()=>{
      document.getElementById("fileOpenElement")?.click();
    };

    const handleFileChange = async (event:React.ChangeEvent<HTMLInputElement>)=>{
      const selectedFiles = event.target.files;
        if (selectedFiles !== null && selectedFiles?.length > 0 && selectedFolderItem !== undefined) {
          const toSend = new FormData();
          for(let i=0; i < selectedFiles.length; ++i) {
            toSend.append("files", selectedFiles[i], selectedFiles[i].name);
          }
          toSend.append("folderId", "" + selectedFolderItem.id);
          let res : FilearchAPIResponse<FilearchFile> | null = await UploadImage(toSend);
          if (res === null) {
            toast.error("Error uploading file. No data returned.");
            return;
          }

          for (let i = 0; i < res.action_responses.length; ++i) {
            let ar: ActionResponse<FilearchFile> = res.action_responses[i];
            if (ar.errors !== null && ar.errors.length > 0) {
              for(let j = 0; j < ar.errors.length; ++j) {
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
          fetchData(true);
        }
    };

    const fetchData = async(isInitialCall:boolean)=>{
      if (selectedFolderItem === undefined) {
        setData([]);
        setMoreToLoad(false);
        setLastListItemId(null);
      } else { 
        const res = await GetFiles(selectedFolderItem.id, isInitialCall ? null : lastListItemId);
        if (res === null || res.data === null || res.data.length < 1) {
          setData([]);
          setMoreToLoad(false);
          setLastListItemId(null);
        } else {
          const mappedResults = res.data.map(z=>({
            id: z.id,
            ownerId: z.owner_id,
            folderId: z.folder_id,
            storageType: z.storage_type,
            storageKey: z.storage_key,
            originalFilename: z.original_filename
          }));
          setLastListItemId(mappedResults[mappedResults.length - 1].id);
          if (isInitialCall) {
            setData(mappedResults);
          } else {
            setData(existingData=>[...existingData, ...mappedResults]);
          }
          setMoreToLoad(res.has_next);
        }
      }
    }

    useEffect(()=>{
      fetchData(true);
    }, [selectedFolderItem]);

    useEffect(()=>{
      if (inView) {
        fetchData(false);
      }
    }, [inView]);
    
    function deleteFolderEventComplete(deletedId: number):void {
      setData(prevData=> removeFile(prevData, deletedId))
    }

    return (
      <div>
        <h2 style={{
          borderBottom: 'var(--bs-border-color) 1px solid',
          padding: '0.5rem'
          }}>Folder: {selectedFolderItem?.name}</h2>
        <div className="position-absolute overflow-y-scroll"
          style={{
            height: 'calc(100vh - 12.75rem)',
            width: 'calc(75vw - 0.5rem)',
            left: '0.5rem'
          }}>
          {data.length <= 0 ?
          <div className="text-center"
            style={{
              position: 'relative',  
              top: 'calc(50vh - 10.75rem)'
            }}>
            <i className="bi bi-x-circle text-danger" style={{fontSize: '4rem'}}></i>
            <h3>NO DATA</h3>
          </div> : 
          <div className="row" style={{width:'calc(75vw - 1.0rem'}}>
            {data.map(file => <FileItemView key={file.id} fileData={file} deleteEventCompleteCallback={deleteFolderEventComplete}/>)}
            {moreToLoad &&
            <div className="text-center" ref={ref}>
              Loading...
            </div>}
          </div>
          }
        </div>
        <Button disabled={selectedFolderItem === undefined} onClick={addFiles} style={{position:"absolute", top:"calc(100vh - 13rem)", left:"calc(75vw - 6rem)", borderRadius:"30px", padding:"11px 16px", border:"solid 1px var(--bs-secondary)"}}>
          <i className="bi bi-plus-lg"></i>
        </Button>
        <input type="file" id="fileOpenElement" onChange={handleFileChange} style={{display:"none"}}/>
        <div style={{
          position:'absolute', 
          borderTop: 'var(--bs-border-color) 1px solid',
          top:'calc(100vh - 8.5rem)',
          width: '75vw',
          paddingTop: '.5rem'}}>
        </div>
      </div>
    );
}