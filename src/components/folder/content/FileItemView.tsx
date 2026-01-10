'use client'

import { FileItem } from "./FileItem";
import { useEffect, useState } from "react";
import { DownloadThumbnail } from "./actions/DownloadImage";
import styles from "./FolderContent.module.css"
import { Button } from "react-bootstrap";
import { DeleteFileAction } from "./actions/DeleteFile";
import { FilearchFile } from "@/filearch_api/files";
import { ActionResponse, ErrorResponse } from "@/filearch_api/FilearchAPI";
import toast from "react-hot-toast";

export default function FileItemView({ fileData, deleteEventCompleteCallback, showSelectedImageCallback }: { fileData: FileItem, deleteEventCompleteCallback: (deletedId: number) => void, showSelectedImageCallback: (selectedImage: FileItem) => void}) {
  const [isLoading, setIsLoading] = useState(true);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const getImageToDisplay = async () => {
    const rawImageData = await DownloadThumbnail(fileData.id);
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

  function imageSelected() {
    showSelectedImageCallback(fileData);
  }

  return (
    <div className="text-white bg-primary m-2" style={{ width: '18rem', paddingLeft: "0px", paddingRight: "0px" }}>
      <div style={{width:"0px", height:"0px"}} >
        <Button className={styles.fileitem_deletebutton} onClick={deleteItem}>
          <i className="bi bi-trash3" style={{ fontSize: '0.75rem' }}></i>
        </Button>
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