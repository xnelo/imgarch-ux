'use client'

import { FileItem } from "./FileItem";
import { useEffect, useState } from "react";
import { DownloadThumbnail } from "./actions/DownloadImage";
import styles from "./FileViewer.module.css";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";
import { ActionResponse, ErrorResponse, FilearchFile, GroupItemType } from "@/filearch_api/FilearchAPI";
import toast from "react-hot-toast";
import { DeleteFileAction } from "./actions/DeleteFile";
import { useDialog } from "../dialogs/DialogProvider";
import { RemoveItemFromGroupAction } from "./actions/GroupActions";

export default function FileItemView(
  { 
    fileData, 
    deleteEventCompleteCallback, 
    showSelectedImageCallback,
    refreshListCallback,
    groupViewId
  }: 
    { 
      fileData: FileItem, 
      deleteEventCompleteCallback: (deletedId: number) => void, 
      showSelectedImageCallback: (selectedImage: FileItem) => void,
      refreshListCallback: () => void
      groupViewId?: number
    }
  ) {
  const [isLoading, setIsLoading] = useState(true);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const getImageToDisplay = async () => {
    const rawImageData = await DownloadThumbnail(fileData.id, groupViewId);
    if (rawImageData === null) {
      setIsLoading(false);
    } else {
      var blob = new Blob([rawImageData], { type: "image/jpeg" });
      var imageUrl = URL.createObjectURL(blob);
      setImgUrl(imageUrl);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getImageToDisplay();
  }, []);

  const deleteItem = async () => {
    const deleted: ActionResponse<FilearchFile> | null = await DeleteFileAction(fileData.id);
    if (deleted === null) {
      toast.error("Error deleting item. Please contact support. FileId=" + fileData.id);
    } else {
      if (deleted.errors !== null && deleted.errors.length > 0) {
        for (let i = 0; i < deleted.errors.length; ++i) {
          const error: ErrorResponse = deleted.errors[i];
          toast.error("Error deleting item '" + error.error_message + "' (" + error.error_code + ")");
        }
      } else {
        toast.success("File deleted successfully: " + deleted.data?.original_filename);
        deleteEventCompleteCallback(fileData.id);
      }
    }
  };

  const { openYesNoDialog } = useDialog();

  const deleteItemClicked = async () => {
    openYesNoDialog("Are you sure?", <p>Do you really want to delete file <b>{fileData.originalFilename}</b><i>({fileData.id})</i>?</p>, deleteItem);
  };

  function imageSelected() {
    showSelectedImageCallback(fileData);
  }

  const removeItem = async () => {
    if (groupViewId === undefined) {
      toast.error("Group Id is not defined. Contact support.");
      return;
    }
    
    const successfullyRemoved:boolean = await RemoveItemFromGroupAction(groupViewId, fileData.id, GroupItemType.FILE);
    if (!successfullyRemoved) {
      toast.error("Error removing file '" + fileData.originalFilename + "'(" + fileData.id + ") from group.");
    } else { 
      toast.success("File '" + fileData.originalFilename + "' removed from group.");
      deleteEventCompleteCallback(fileData.id);
    }
  };

  const removeItemClicked = async () => {
    openYesNoDialog("Are you sure?", <p>Do you really want to remove <b>{fileData.originalFilename}</b><i>({fileData.id})</i>?</p>, removeItem);
  };

  const removeFolder = async () => {
    if (groupViewId === undefined) {
      toast.error("Group Id is not defined. Contact support.");
      return;
    }

    if (fileData.folder_in_id === null) {
      toast.error("We do not have folder ID. unable to remove folder.");
      return;
    }

    const successfullyRemoved: boolean = await RemoveItemFromGroupAction(groupViewId, fileData.folder_in_id, GroupItemType.FOLDER);
    if (!successfullyRemoved) {
      toast.error("Error removing folder '" + fileData.folder_in + "' from group.");
    } else {
      toast.success("Folder '" + fileData.folder_in +"' removed.");
      refreshListCallback();
    }
  };

  const removeFolderClicked = async () => {
    openYesNoDialog("Are you sure?",
      <p>Do you really want to remove folder {fileData.folder_in}({fileData.folder_in_id}) from group.</p>,
      removeFolder);
  };

  return (
    <div className="text-white bg-primary m-2" style={{ width: '18rem', paddingLeft: "0px", paddingRight: "0px" }}>
      {fileData.folder_in !== null && 
      <div style={{width:'18rem', overflow:'hidden', textWrap:'nowrap', position:'relative', float:'right'}}>
        <div style={{background:'linear-gradient(90deg,rgba(var(--bs-info-rgb), 1) 80%, rgba(var(--bs-primary-rgb), 1) 100%)', color:'black', width:'16rem', paddingTop:'8px', paddingBottom:'8px'}}>
          <Button className={styles.folderItem_removeGroupFolder} onClick={removeFolderClicked}>
            <i className={`bi bi-dash ${styles.folderItem_removeGroupFolder_dash}`}></i>
          </Button>
          <span style={{overflow:'hidden', maxWidth:'12.5rem', paddingLeft:'0.5rem', display:'block'}}>{fileData.folder_in}</span>
        </div>
      </div>}
      <div style={{width:"0px", height:"0px"}} >
        {groupViewId !== undefined && fileData.folder_in === null
        ? <OverlayTrigger trigger="focus" placement="bottom"
            overlay={
              <Popover>
                <Popover.Body>
                  <div key={`fileDDItem_${fileData.id}_delete`}><a className={styles.folderView_defaultAnchor} onClick={deleteItemClicked}>Delete</a></div>
                  <div key={`fileDDItem_${fileData.id}_remove`}><a className={styles.folderView_defaultAnchor} onClick={removeItemClicked}>Remove</a></div>
                </Popover.Body>
              </Popover>
            }>
              <Button className={styles.fileitem_deletebutton}>
                <i className="bi bi-trash3" style={{ fontSize: '0.75rem' }}></i>
              </Button>
        </OverlayTrigger>
        : <Button className={styles.fileitem_deletebutton} onClick={deleteItemClicked}>
            <i className="bi bi-trash3" style={{ fontSize: '0.75rem' }}></i>
          </Button>}
      </div>
      <div onClick={imageSelected}>
        <div className="text-center">
          {isLoading ?
            <div style={{ marginTop: '2rem', marginBottom: '3.33rem' }}>
              <div>
                <img className={styles.rotate_image} src="/loading.png" width={100} height={100} />
              </div>
              <div>
                Loading...
              </div>
            </div> :
            (imgUrl === null ?
              <div className={styles.fileitem_missingimagepos}>
                <i className="bi bi-image" style={{ fontSize: "8em" }}></i>
                <i className={`bi bi-x-circle-fill text-danger ${styles.fileitem_missingimageX}`}></i>
              </div> :
              <img src={imgUrl} height={125} className={styles.fileitem_image} />)
          }
        </div>
        <div className={`text-center ${styles.fileitem_text}`}>
          {fileData.id}<br />
          {fileData.originalFilename}
        </div>
      </div>
    </div>
  );
}