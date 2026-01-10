'use client'

import Modal from 'react-bootstrap/Modal';
import { useEffect, useState } from "react";
import { FileItem } from './FileItem';
import styles from "./FolderContent.module.css"
import { DownloadImage } from './actions/DownloadImage';

export default function FileViewer({ show, fileItemToShow, onHideCallback }: { show: boolean, fileItemToShow: FileItem | undefined, onHideCallback: () => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const getImageToDisplay = async () => {
    setIsLoading(true);
    if (fileItemToShow !== undefined) {
      const rawImageData = await DownloadImage(fileItemToShow.id);
      if (rawImageData === null) {
        setImgUrl(null);
      } else {
        var blob = new Blob([rawImageData], { type: "image/jpeg" });
        var imageUrl = URL.createObjectURL(blob);
        setImgUrl(imageUrl);
      }
      setIsLoading(false);
    }
  }

  return (
    <Modal show={show} fullscreen={true} onShow={getImageToDisplay} onHide={onHideCallback} style={{zIndex:99999}}>
      <Modal.Header closeButton>
        <Modal.Title>{fileItemToShow?.originalFilename}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ?
          <div className='position-absolute top-50 start-50 translate-middle'>
            <div>
              <img className={styles.rotate_image} src="/loading.png" width={100} height={100} style={{filter:'invert(1) opacity(0.333)'}}/>
            </div>
            <div style={{textAlign:'center'}}>
              Loading...
            </div>
          </div> :
          (imgUrl === null ? 
            <div>NO IMAGE</div> :
            <img src={imgUrl}/>
          )}
      </Modal.Body>
    </Modal>
  );
}