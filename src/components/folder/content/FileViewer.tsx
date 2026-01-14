'use client'

import Modal from 'react-bootstrap/Modal';
import { ChangeEvent, useEffect, useState } from "react";
import { FileItem } from './FileItem';
import styles from "./FolderContent.module.css"
import { DownloadImage } from './actions/DownloadImage';
import { Button, Form } from 'react-bootstrap';

const DEFAULT_IMAGE_ZOOM : number = 100;
const MIN_IMAGE_ZOOM : number = 25;
const MAX_IMAGE_ZOOM : number = 400;
const IMAGE_ZOOM_STEP : number  = 5;

export default function FileViewer({ show, fileItemToShow, onHideCallback }: { show: boolean, fileItemToShow: FileItem | undefined, onHideCallback: () => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgZoom, setImgZoom] = useState<number>(DEFAULT_IMAGE_ZOOM);

  const handleOnShow = async() => {
    setImgUrl(null);
    getImageToDisplay();
    handleResetImageZoom();
  }

  const getImageToDisplay = async () => {
    setIsLoading(true);
    if (fileItemToShow !== undefined) {
      const rawImageData = await DownloadImage(fileItemToShow.id);
      if (rawImageData === null) {
        setImgUrl(null);
      } else {
        var blob = new Blob([rawImageData], { type: fileItemToShow.mimeType });
        var imageUrl = URL.createObjectURL(blob);
        setImgUrl(imageUrl);
      }
      setIsLoading(false);
    }
  }

  function handleZoomIn() {
    let imgZoomCalc = imgZoom + IMAGE_ZOOM_STEP;
    if (imgZoomCalc > MAX_IMAGE_ZOOM) {
      imgZoomCalc = MAX_IMAGE_ZOOM;
    }
    setImgZoom(imgZoomCalc);
  }

  function handleZoomOut() {
    let imgZoomCalc = imgZoom - IMAGE_ZOOM_STEP;
    if (imgZoomCalc <= MIN_IMAGE_ZOOM) {
      imgZoomCalc = MIN_IMAGE_ZOOM;
    }
    setImgZoom(imgZoomCalc);
  }

  function handleResetImageZoom() {
    setImgZoom(DEFAULT_IMAGE_ZOOM);
  }

  function handleZoomeRangeInput(ele:ChangeEvent<HTMLInputElement>) {
    setImgZoom(Number.parseInt(ele.target.value));
  }

  return (
    <Modal show={show} fullscreen={true} onShow={handleOnShow} onHide={onHideCallback} style={{zIndex:99999}}>
      <Modal.Header closeButton>
        <Modal.Title>{fileItemToShow?.originalFilename}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className='container-fluid'>
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
            <div className='position-absolute' 
                  style={{
                    left: '0px', 
                    padding: '1rem', 
                    width:'80vw', 
                    height: '91.4vh', 
                    overflow:'scroll'}}>
              <img src={imgUrl} style={{width: `${imgZoom}%`}}/>
            </div>
          )}
          <div className='position-absolute border-start border-1' 
                style={{ 
                  width:'20vw', 
                  padding: '1rem', 
                  left:'80vw', 
                  height: '91.4vh'}}>
            <Button onClick={handleZoomIn}><i className="bi bi-zoom-in"></i></Button>
            <span>{imgZoom}%</span>
            <Button onClick={handleZoomOut}><i className="bi bi-zoom-out"></i></Button>
            <Button onClick={handleResetImageZoom}><i className="bi bi-arrow-counterclockwise"></i></Button>
            <Form.Range min={MIN_IMAGE_ZOOM} step={IMAGE_ZOOM_STEP} max={MAX_IMAGE_ZOOM} value={imgZoom} onChange={handleZoomeRangeInput} id='zoomRange'/>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}