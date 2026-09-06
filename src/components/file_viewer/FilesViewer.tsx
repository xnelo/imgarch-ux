import { CSSProperties, useEffect, useState } from "react";
import { FileItem } from "./FileItem";
import FileItemView from "./FileItemView";
import { useInView } from "react-intersection-observer";
import FileViewer from "./FileViewer";
import { FilearchFile, FilearchGroupFile, PaginationContract } from "@/filearch_api/FilearchAPI";

function isGroupFile(toCheck:any): toCheck is FilearchGroupFile {
  return toCheck && 'item_type' in toCheck && 'folder_in' in toCheck && 'folder_in_id' in toCheck;
}

function removeFile(currData: FileItem[], deletedId: number): FileItem[] {
  const newArray: FileItem[] = [];

  for (const item of currData) {
    if (item.id === deletedId) {
      continue;
    } else {
      newArray.push(item);
    }
  }

  return newArray;
}

/**
 * Files Viewer component. Used to display files in a folder, with infinite scroll pagination. Also handles showing the file viewer modal when a file is selected.
 * @param getFileFunction Function that takes an afterId (for pagination) and returns a PaginationContract of FilearchFiles. This is used to fetch the files to display.
 * @param refreshTrigger A number that is used to trigger a refresh of the file list when it changes. This should be incremented whenever the underlying data changes (e.g. a file is added or deleted) to ensure the viewer fetches the latest data. 
 */
export default function FilesViewer(
  { 
    getFileFunction, 
    refreshTrigger, 
    groupViewId,
    style }: 
    { getFileFunction: (afterId: number|null) => Promise<PaginationContract<FilearchFile> | null>, 
      refreshTrigger: number,
      groupViewId?: number,
      style?: CSSProperties | undefined }) {
  const [data, setData] = useState<FileItem[]>([]);
  const [moreToLoad, setMoreToLoad] = useState<boolean>(true);
  const [lastListItemId, setLastListItemId] = useState<number | null>(null);
  const { ref, inView } = useInView();

  const fetchData = async (isInitialCall: boolean) => {
    const res = await getFileFunction(isInitialCall ? null : lastListItemId);
    if (res === null || res.data === null || res.data.length < 1) {
      setData([]);
      setMoreToLoad(false);
      setLastListItemId(null);
    } else {
      const mappedResults = res.data.map(z => ({
        id: z.id,
        ownerId: z.owner_id,
        folderId: z.folder_id,
        storageType: z.storage_type,
        storageKey: z.storage_key,
        originalFilename: z.original_filename,
        mimeType: z.mime_type,
        item_type: isGroupFile(z) ? z.item_type : null,
        folder_in: isGroupFile(z) ? z.folder_in : null,
        folder_in_id: isGroupFile(z) ? z.folder_in_id : null
      }));
      setLastListItemId(mappedResults[mappedResults.length - 1].id);
      if (isInitialCall) {
        setData(mappedResults);
      } else {
        setData(existingData => [...existingData, ...mappedResults]);
      }
      setMoreToLoad(res.has_next);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, [refreshTrigger]);

  useEffect(() => {
    if (inView) {
      fetchData(false);
    }
  }, [inView]);

  function deleteFileEventComplete(deletedId: number): void {
    setData(prevData => removeFile(prevData, deletedId))
  }

  const [show, setShow] = useState(false);
  const [shownFileItem, setShownFileItem] = useState<FileItem | undefined>(undefined);

  const handleShowSelectedImage = async (selectedImage: FileItem) => {
    setShownFileItem(selectedImage);
    setShow(true);
  };

  function handleCloseSelectedImage() {
    setShow(false);
  };

  function handleRefreshList() {
    fetchData(true);
  }

  return (
    <>
      <FileViewer
        show={show}
        fileItemToShow={shownFileItem}
        onHideCallback={handleCloseSelectedImage}
        groupViewId={groupViewId} />
      <div className="overflow-y-scroll"
        style={style}>
        {data.length <= 0 ?
          <div className="text-center"
            style={{
              position: 'relative',
              top: 'calc(50vh - 10.75rem)'
            }}>
            <i className="bi bi-x-circle text-danger" style={{ fontSize: '4rem' }}></i>
            <h3>NO DATA</h3>
          </div> :
          <div className="row" style={{ width: '100%' }}>
            {data.map(file => <FileItemView 
                                key={file.id} 
                                fileData={file} 
                                deleteEventCompleteCallback={deleteFileEventComplete} 
                                showSelectedImageCallback={handleShowSelectedImage}
                                refreshListCallback={handleRefreshList}
                                groupViewId={groupViewId} />)}
            {moreToLoad &&
              <div className="text-center" ref={ref}>
                Loading...
              </div>}
          </div>
        }
      </div>
    </>
  );
}