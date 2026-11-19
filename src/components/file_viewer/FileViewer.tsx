'use client'

import { ActionResponse, FilearchFile } from "@/filearch_api/FilearchAPI";
import { FilearchFolder } from "@/filearch_api/folder";
import styles from "./FileViewer.module.css";
import { ChangeEvent, useEffect, useState } from "react";
import { DownloadImage } from "./actions/DownloadImage";
import { Accordion, Button, Form } from "react-bootstrap";
import TagSearch from "./TagSearch";
import { FilearchTag } from "@/filearch_api/tag";
import TagViewItem, { TagItem } from "./TagViewItem";
import ShareTagModal from "./ShareTagModal";
import { GetTagsForFile } from "./actions/Tags";
import { GetFolderPath } from "./actions/FileActions";

const DEFAULT_IMAGE_ZOOM: number = 100;
const MIN_IMAGE_ZOOM: number = 25;
const MAX_IMAGE_ZOOM: number = 400;
const IMAGE_ZOOM_STEP: number = 5;

function FileViewLoading() {
  return(
    <div style={{position:'relative', width:'100px', left:'calc(50% - 50px)'}}>
      <div>
        <img className={styles.rotate_image} src="/loading.png" width={100} height={100} style={{ filter: 'invert(1) opacity(0.333)' }} />
      </div>
      <div style={{paddingLeft:'12px'}}>
        Loading...
      </div>
    </div>
  );
}

function FileViewImage({imgUrl, imgZoom}:{imgUrl:string | null, imgZoom:number}) {
  if (imgUrl === null) {
    return (<h1>NO IMAGE</h1>);
  } else {
    return (
      <img src={imgUrl} style={{ width: `${imgZoom}%` }} />
    );
  }
}

export default function FileViewer({fileData, height, groupViewId}:{fileData:FilearchFile, height:string|number, groupViewId?:number|undefined}) {
  if (fileData === undefined) {
    return (
      <div><h1>File Data incomplete. Please contact support.</h1></div>
    );
  }

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imgZoom, setImgZoom] = useState<number>(DEFAULT_IMAGE_ZOOM);
  const [imgUrl, setImgUrl] = useState<string|null>(null);
  const [imgTags, setImgTags] = useState<TagItem[] | null>(null);

  const getImageToDisplay = async () => {
    setIsLoading(true);
    const rawImageData = await DownloadImage(fileData.id);
    if (rawImageData === null) {
      setImgUrl(null);
    } else {
      var blob = new Blob([rawImageData], { type: fileData.mime_type });
      var imageUrl = URL.createObjectURL(blob);
      setImgUrl(imageUrl);
    }
    setIsLoading(false);
  };

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

  function handleZoomeRangeInput(ele: ChangeEvent<HTMLInputElement>) {
    setImgZoom(Number.parseInt(ele.target.value));
  }

  function tagAddedToFile(filearchTag: FilearchTag) {
    const newTagItem: TagItem = { id: filearchTag.id, tagName: filearchTag.tag_name };
    if (imgTags !== null) {
      setImgTags([...imgTags, newTagItem]);
    } else {
      setImgTags([newTagItem]);
    }
  }

  function tagRemovedFromFile(tagId: number) {
    if (imgTags !== null) {
      const newTagItems = imgTags.filter(tag => tag.id !== tagId);
      setImgTags(newTagItems);
    }
  }

  const [showTagModal, setShowTagModal] = useState<boolean>(false);
  const [tagModalTagData, setTagModalTagData] = useState<TagItem|undefined>(undefined);

  function showTagModalCallback(tagId:number){
    const tagData = imgTags?.find(tag=>tag.id == tagId);

    if (tagData === undefined) {
      return; // DO NOTHING
    }

    setShowTagModal(true);
    setTagModalTagData(tagData);
  }

  function onTagModalHideCallback() {
    setShowTagModal(false);
  }

  const getImageTags = async () => {
    setImgTags(null);
    if (fileData !== undefined) {
      const tagsArray = await GetTagsForFile(fileData.id, groupViewId);
      if (tagsArray !== null) {
        let finalTags: TagItem[] = [];
        tagsArray.forEach((filearchTag: FilearchTag) => {
          finalTags.push({ id: filearchTag.id, tagName: filearchTag.tag_name });
        });
        setImgTags(finalTags);
      }
    }
  }

  const [folderPath, setFolderPath] = useState<FilearchFolder[]|null>(null);

  const getImageFolderPath = async () => {
    if (fileData !== undefined) {
      const folderPathData: ActionResponse<FilearchFolder[]> | null = await GetFolderPath(fileData.id);
      if (folderPathData !== null && folderPathData.data !== null) {
        // from the GetFoldersPath endpoint the folders are guaranteed to be in descending order from (root)
        setFolderPath(folderPathData.data);
      }
    }
  };

  useEffect(() => { 
    getImageToDisplay();
    getImageTags();
    getImageFolderPath();
  }, [])

  return (
    <>
      <ShareTagModal
        show={showTagModal}
        tagItemToShow={tagModalTagData}
        onHideCallback={onTagModalHideCallback}
      />
      <div style={{height}}>
        <div style={{height, width:'80%', float:'left', overflow:'scroll'}}>
          {isLoading ? <FileViewLoading/> : <FileViewImage imgUrl={imgUrl} imgZoom={imgZoom}/> }
        </div>
        <div style={{width:'20%', float:'left'}}>
          <Accordion alwaysOpen>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Zoom</Accordion.Header>
              <Accordion.Body>
                <Button onClick={handleZoomIn}><i className="bi bi-zoom-in"></i></Button>
                <span>{imgZoom}%</span>
                <Button onClick={handleZoomOut}><i className="bi bi-zoom-out"></i></Button>
                <Button onClick={handleResetImageZoom}><i className="bi bi-arrow-counterclockwise"></i></Button>
                <Form.Range min={MIN_IMAGE_ZOOM} step={IMAGE_ZOOM_STEP} max={MAX_IMAGE_ZOOM} value={imgZoom} onChange={handleZoomeRangeInput} id='zoomRange' />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Tags</Accordion.Header>
              <Accordion.Body>
                <TagSearch fileId={fileData?.id} tagAddedCallback={tagAddedToFile} groupViewId={groupViewId} />
                <div className='mt-2'>
                  {(imgTags === null || imgTags.length <= 0) ?
                    <span>NO TAGS</span> :
                    imgTags.map(tag => <TagViewItem key={tag.id} tagItem={tag} fileOn={fileData?.id} tagRemovedCallback={tagRemovedFromFile} showTagModalCallback={showTagModalCallback} groupViewId={groupViewId}/>)
                  }
                </div>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>Metadata</Accordion.Header>
              <Accordion.Body>
                <div><b>File Id:</b> {fileData?.id}</div>
                <div><b>Original Filename:</b> {fileData?.original_filename}</div>
                <div><b>Mime Type:</b> {fileData?.mime_type}</div>
                <div><b>Folder:</b> {folderPath === null ? <span>ERROR</span>:folderPath.map(f=><a>{f.folder_name}/</a>)}</div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </div>
    </>
  );
}