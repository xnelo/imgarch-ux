'use client'

import Modal from 'react-bootstrap/Modal';
import { ChangeEvent, useEffect, useState } from "react";
import { FileItem } from './FileItem';
import styles from "./FolderContent.module.css"
import { DownloadImage } from './actions/DownloadImage';
import { Button, Form } from 'react-bootstrap';
import { GetTagsForFile } from './actions/Tags';
import { FilearchTag } from '@/filearch_api/tag';
import TagSearch from '../utils/TagSearch';

interface TagItem {
  id: number;
  tagName: string;
}

const DEFAULT_IMAGE_ZOOM : number = 100;
const MIN_IMAGE_ZOOM : number = 25;
const MAX_IMAGE_ZOOM : number = 400;
const IMAGE_ZOOM_STEP : number  = 5;

export default function FileViewer({ show, fileItemToShow, onHideCallback }: { show: boolean, fileItemToShow: FileItem | undefined, onHideCallback: () => void }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgZoom, setImgZoom] = useState<number>(DEFAULT_IMAGE_ZOOM);
  const [imgTags, setImgTags] = useState<TagItem[] | null>(null);

  const handleOnShow = async() => {
    setImgUrl(null);
    getImageToDisplay();
    handleResetImageZoom();
    getImageTags();
  }

  const getImageTags = async () => {
    setImgTags(null);
    if (fileItemToShow !== undefined) {
      const tagsArray = await GetTagsForFile(fileItemToShow.id);
      if (tagsArray !== null) {
        let finalTags : TagItem[] = [];
        tagsArray.forEach((filearchTag:FilearchTag) => {
          finalTags.push({id:filearchTag.id, tagName:filearchTag.tag_name});
        });
        setImgTags(finalTags);
      }
    }
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

  function tagAddedToFile(filearchTag: FilearchTag) {
    const newTagItem : TagItem = {id: filearchTag.id, tagName: filearchTag.tag_name};
    if (imgTags !== null) {
      setImgTags([...imgTags, newTagItem]);
    } else {
      setImgTags([newTagItem]);
    }
  }

  return (
    <Modal show={show} fullscreen={true} onShow={handleOnShow} onHide={onHideCallback} style={{zIndex:9999}}>
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
            <div style={{backgroundColor:'red'}}>
              <div className='text-bg-light'>Tags</div>
              <TagSearch fileId={fileItemToShow?.id} tagAddedCallback={tagAddedToFile}/>
              <div>
                {(imgTags === null || imgTags.length <= 0) ? 
                  <span>NO TAGS</span> : 
                  imgTags.map(tag=><span key={tag.id} className='badge rounded-pill text-bg-primary me-2'>{tag.tagName}</span>)
                }
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}