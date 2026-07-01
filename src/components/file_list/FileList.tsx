import { FormEvent, useEffect, useState } from "react";
import { GetAllFiles } from "./actions/GetFiles";
import { useInView } from "react-intersection-observer";

interface FileListItem {
  id: number;
  originalFilename: string;
}

export default function FileList(
  {fileSelectionChanged}:
  {fileSelectionChanged:(id:number, added:boolean)=>void}) {

  const [fileListData, setFileListData] = useState<FileListItem[]>([]);
  const [moreToLoad, setMoreToLoad] = useState<boolean>(true);
  const [lastListItemId, setLastListItemId] = useState<number | null>(null);
  const { ref, inView } = useInView();

  const fetchFilesData = async (isInitialCall:boolean) => {
    const res = await GetAllFiles(isInitialCall ? null : lastListItemId);
    if (res === null || res.data === null || res.data.length < 1) {
      // No Data
      setFileListData([]);
      setMoreToLoad(false);
      setLastListItemId(null);
    } else {
      const mappedResults = res.data.map(i => ({
        id: i.id,
        originalFilename: i.original_filename
      }));
      setLastListItemId(mappedResults[mappedResults.length - 1].id);
      if (isInitialCall) {
        setFileListData(mappedResults);
      } else {
        setFileListData(existingData => [...existingData, ...mappedResults]);
      }
      setMoreToLoad(res.has_next);
    }
  };

  const fileListSelectionChanged = (eventData:FormEvent<HTMLInputElement>, fileData:FileListItem) => {
    fileSelectionChanged(fileData.id, eventData.currentTarget.checked);
  };

  useEffect(() => {
      fetchFilesData(true);
    }, []);

    useEffect(() => {
    if (inView) {
      fetchFilesData(false);
    }
  }, [inView]);

  return (
    <div>
      {fileListData.length <= 0 ? <h3>NO DATA</h3> :
        <div style={{paddingLeft:'5px'}}>
          {fileListData.map(file=>
            <div key={`fl_${file.id}`} className="form-check">
              <input className="form-check-input" type="checkbox" id={`fl_cb_${file.id}`} onClick={(eventData)=>fileListSelectionChanged(eventData, file)}/>
              <label className="form-check-label" htmlFor={`fl_cb_${file.id}`}>
                {file.originalFilename}
              </label>
            </div>)}
          {moreToLoad && <div ref={ref}>Loading...</div>}
        </div>
      }
    </div>
  );
}