import { useEffect, useState } from "react";
import { FileItem } from "./FileItem";
import FileItemView from "./FileItemView";
import { useInView } from "react-intersection-observer";
import { FolderItem } from "../folder/FolderItem";
import { GetFiles } from "./actions/GetFiles";
import FileViewer from "./FileViewer";

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

export default function FilesViewer({ selectedFolderItem }: { selectedFolderItem: FolderItem | undefined }) {
  const [data, setData] = useState<FileItem[]>([]);
  const [moreToLoad, setMoreToLoad] = useState<boolean>(true);
  const [lastListItemId, setLastListItemId] = useState<number | null>(null);
  const { ref, inView } = useInView();

  const fetchData = async (isInitialCall: boolean) => {
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
        const mappedResults = res.data.map(z => ({
          id: z.id,
          ownerId: z.owner_id,
          folderId: z.folder_id,
          storageType: z.storage_type,
          storageKey: z.storage_key,
          originalFilename: z.original_filename,
          mimeType: z.mime_type
        }));
        setLastListItemId(mappedResults[mappedResults.length - 1].id);
        if (isInitialCall) {
          setData(mappedResults);
        } else {
          setData(existingData => [...existingData, ...mappedResults]);
        }
        setMoreToLoad(res.has_next);
      }
    }
  };

  useEffect(() => {
    fetchData(true);
  }, [selectedFolderItem]);

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

  return (
    <>
      <FileViewer
        show={show}
        fileItemToShow={shownFileItem}
        onHideCallback={handleCloseSelectedImage} />
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
            <i className="bi bi-x-circle text-danger" style={{ fontSize: '4rem' }}></i>
            <h3>NO DATA</h3>
          </div> :
          <div className="row" style={{ width: 'calc(75vw - 1.0rem' }}>
            {data.map(file => <FileItemView key={file.id} fileData={file} deleteEventCompleteCallback={deleteFileEventComplete} showSelectedImageCallback={handleShowSelectedImage} />)}
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