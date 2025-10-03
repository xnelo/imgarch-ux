'use client'
import { MouseEvent } from "react";
import ActionButtonBase from "./ActionButtonBase";

export default function DeleteFolder({selectedFolder}: {selectedFolder: number}) {
    const onClickEvent = (event:MouseEvent<HTMLElement>)=>{
        alert("Delete Folder button clicked" + event.currentTarget.tagName);
    }

    return (
        <ActionButtonBase 
            iconName="bi-folder-minus" 
            selectedFolder={selectedFolder}
            onClickEvent={onClickEvent} />
    );
}