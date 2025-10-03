'use client'

import { MouseEvent } from "react";
import { NO_FOLDER_SELECTED } from "../../FolderView";
import styles from "../FolderTree.module.css"

export default function ActionButtonBase({iconName, selectedFolder, onClickEvent}:{iconName: string, selectedFolder: number, onClickEvent:(event:MouseEvent<HTMLElement>)=>void}) {
    
    return (
        <button type="button" 
                className={`btn btn-outline-primary ${styles.FolderTree_ActionButtonSizing}`} 
                onClick={onClickEvent}
                disabled={selectedFolder === NO_FOLDER_SELECTED}>
                    <i className={`bi ${iconName} ${styles.FolderTree_ActionButtonIconSizing}`}/>
        </button>
    );
}