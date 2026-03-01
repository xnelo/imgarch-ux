'use client';

import { useState } from "react";
import FilesViewer from "../file_viewer/FilesViewer";
import { FilearchFile } from "@/filearch_api/files";
import { PaginationContract } from "@/filearch_api/FilearchAPI";
import { SearchFiles } from "./actions/SearchFiles";

export default function FileSearch() {
  
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  async function SearchFiles_Internal(afterId: number | null) : Promise<PaginationContract<FilearchFile>|null> {
    return await SearchFiles(searchText, afterId);
  }

  return (
    <div>
      <div style={{padding: '1rem', width:'25%', float:'left'}}>
        <h3>Search Filters</h3>
        <input type="text" value={searchText} onChange={handleChange} placeholder="Search term..." className="form-control" style={{marginBottom:'0.5rem'}}/>
        <button className="btn btn-primary" onClick={() => setRefreshTrigger(prev => prev + 1)}>Search</button>
      </div>
      <div style={{width:'75%', float:'left', borderLeft: 'var(--bs-border-color) 1px solid'}}>
        <FilesViewer 
          getFileFunction={SearchFiles_Internal} 
          refreshTrigger={refreshTrigger} 
          style={{
          height: 'calc(100vh - 5.75rem)',
          width: '100%',
          paddingLeft: '1vw'
        }}/>
      </div>
    </div>
  );
}