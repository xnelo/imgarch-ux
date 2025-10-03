'use client'
import { MouseEvent } from "react";
import ActionButtonBase from "./ActionButtonBase";

export default function MoveFolder({selectedFolder}: {selectedFolder: number}) {
    const onClickEvent = (event:MouseEvent<HTMLElement>)=>{
        alert("Move Folder button clicked" + event.currentTarget.tagName);
    }

    return (
        <ActionButtonBase 
            iconName="bi-folder-symlink" 
            selectedFolder={selectedFolder} 
            onClickEvent={onClickEvent} />
    );
}