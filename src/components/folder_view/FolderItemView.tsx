'use client'

import { MouseEvent, useState } from "react";
import { FolderItem } from "./FolderItem";
import styles from "./FolderView.module.css";

export default function FolderItemView({data, selectFolderFunc, selectedFolderState}:{data:FolderItem, selectFolderFunc:(selectedFolderId:number)=>void, selectedFolderState:number}){
    let [isExpanded, setIsExpanded] = useState(false);
    

    function toggleDropdownEvent(event: MouseEvent<HTMLElement>){
        setIsExpanded(!isExpanded);
    }

    return (
        <div className={data.children.length > 0 ? styles.FolderContinuityLine_NoChildPadding : `${styles.FolderContinuityLine} ${styles.FolderContinuityLine_ChildPadding}`}>
            {data.children.length > 0 &&
            <i className={`${styles.ExpanderBase} bi ${isExpanded ? "bi-chevron-down" : "bi-chevron-right"}`}           
                onClick={toggleDropdownEvent} />}
            <a className={`${styles.FolderName} ${selectedFolderState === data.id && styles.Foldername_Selected}`} onClick={() => selectFolderFunc(data.id)}>{data.name}</a>
            <div className={isExpanded ? styles.FolderContinuityLine : "d-none"}>
                <ul className={styles.ChildList}>
                    {data.children.map((child: FolderItem) => (
                        <li key={child.id}><FolderItemView data={child} selectFolderFunc={selectFolderFunc} selectedFolderState={selectedFolderState}/></li>
                    ))}
                </ul>
            </div>
        </div>
    );
}