import { FormEvent, useEffect, useState } from "react";
import { GetAllFoldersAction } from "./actions/GetAllFolders";
import { FilearchFolder } from "@/filearch_api/folder";

export default function FolderList(
  {folderSelectionChanged}:
  {folderSelectionChanged:(id:number, added:boolean)=>void}) {

  const [folderListData, setFolderListData] = useState<FilearchFolder[]>([]);

  const fetchFolderData = async () => {
    const res = await GetAllFoldersAction();
    if (res === null || res.length <= 0) {
      // No Data
      setFolderListData([]);
    } else {
      setFolderListData(res);
    }
  };

  useEffect(() => {
        fetchFolderData();
      }, []);

  const folderListSelectionChanged = (eventData:FormEvent<HTMLInputElement>, folderData:FilearchFolder) => {
    folderSelectionChanged(folderData.id, eventData.currentTarget.checked);
  };

  return (
    <div>
      {folderListData.length <= 0 ? <h3>NO DATA</h3>:
      <div style={{paddingLeft:'5px'}}>
        {folderListData.map(folder=>
          <div key={`fol_${folder.id}`} className="form-check">
            <input className="form-check-input" type="checkbox" id={`fol_cb_${folder.id}`} onClick={(eventData)=>folderListSelectionChanged(eventData, folder)}/>
            <label className="form-check-label" htmlFor={`fol_cb_${folder.id}`}>
              {folder.parent_id === null ? "(root)" : folder.folder_name}
            </label>
          </div>
        )}
      </div>
      }
    </div>
  );
}