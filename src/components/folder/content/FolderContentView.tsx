'use client'

import { useEffect, useState } from "react";
import { FolderItem } from "../FolderItem";
import { GetFiles } from "./actions/GetFiles";
import { FileItem } from "./FileItem";
import FileItemView from "./FileItemView";

export default function FolderContentView({selectedFolderItem}:{selectedFolderItem:FolderItem | undefined}) {
    
    const [data,setData] = useState<FileItem[]>([]);
    const [moreToLoad, setMoreToLoad] = useState<boolean>(true);
    const [lastListItemId, setLastListItemId] = useState<number|null>(null);

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
            {data.map(file => <FileItemView fileData={file}/>)}
          </div>}
        </div>
        <div style={{
          position:'absolute', 
          borderTop: 'var(--bs-border-color) 1px solid',
          top:'calc(100vh - 8.5rem)',
          width: '75vw',
          paddingTop: '.5rem'}}>
          <button onClick={()=>fetchData(false)} disabled={!moreToLoad}>Load More</button>
        </div>
      </div>
    );
}