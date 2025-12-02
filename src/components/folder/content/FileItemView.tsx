'use client'

import { FileItem } from "./FileItem";
import { useEffect, useState } from "react";
import { DownloadThumbnail } from "./actions/DownloadImage";
import styles from "./FolderContent.module.css"

export default function FileItemView({fileData} : {fileData: FileItem}) {
  const [isLoading, setIsLoading] = useState(true);
  const [imgUrl, setImgUrl] = useState<string|null>(null);
  
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

  useEffect(()=>{
    getImageToDisplay();
  }, []);

  return (
    <div className="text-white bg-primary m-2" style={{ width: '18rem', height: '18rem' }}>
      <div className="text-center">
        {isLoading ? 
            <div style={{marginTop:'2rem', marginBottom:'3.33rem'}}>
              <div>
              <img className={styles.rotate_image} src="/loading.png" width={100} height={100}/>
              </div>
              <div>
              Loading...
              </div>
            </div> :
            (imgUrl === null ? 
              <div style={{position:'relative'}}>
                <i className="bi bi-image" style={{fontSize:"8em"}}></i> 
                <i className="bi bi-x-circle-fill text-danger" style={
                  {fontSize:"4em",
                    position:"absolute",
                    top:"40%",
                    left:"52%"
                  }}></i>
              </div>: 
            <img src={imgUrl} height={125} style={{marginTop:'2.0rem', marginBottom:'2.1875rem'}}/>)
          }
      </div>
      <div className="text-center" style={{marginTop:'1rem'}}>
        {fileData.id}<br/>
        {fileData.originalFilename}
      </div>
    </div>
  );
}