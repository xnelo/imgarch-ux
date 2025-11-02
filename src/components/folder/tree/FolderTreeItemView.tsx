'use client'

import { MouseEvent, useState } from "react";
import { FolderItem } from "../FolderItem";
import styles from "./FolderTree.module.css";
import { useDrag, useDrop } from "react-dnd";
import { DragTypes } from "../dnd/DragTypes";
import { Button, Modal } from "react-bootstrap";

export default function FolderTreeItemView({data, selectFolderFunc, selectedFolderState}:{data:FolderItem, selectFolderFunc:(selectedFolderId:number)=>void, selectedFolderState:number}){
    const [isExpanded, setIsExpanded] = useState(false);
    const [folderToMove, setFolderToMove] = useState<FolderItem|undefined>(undefined);
    const [folderToMoveTo, setFolderToMoveTo] = useState<FolderItem|undefined>(undefined);

    function toggleDropdownEvent(event: MouseEvent<HTMLElement>){
        setIsExpanded(!isExpanded);
    }

    const [{ isDragging }, drag, preview] = useDrag(
        () => ({
            type: DragTypes.FOLDER,
            item: data,
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            })
        })
    );

    const [{isOver, canDrop}, drop] = useDrop(() =>({
        accept: DragTypes.FOLDER,
        drop: (item:FolderItem, monitor) => {
            if (monitor.didDrop()) {
                return;
            }
            setFolderToMove(item);
            setFolderToMoveTo(data);
            setShow(true);
        },
        canDrop: (item:FolderItem, monitor) => {
            return !item.isDescendant(data)
                    && item.parentId !== data.id
                    && item.id !== data.id;
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop()
        })
    }));

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleMoveFolder = async () => {
      setShow(false);

      // TODO: move folder code goes here
    };

    return (
      <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Move Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span>Are you sure you want to move the '{folderToMove?.name}' folder into the '{folderToMoveTo?.name}' folder?</span>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
              Close
          </Button>
          <Button variant="primary" onClick={handleMoveFolder}>
              Move Folder
          </Button>
        </Modal.Footer>
      </Modal>
      <div ref={el=>{drag(el)}} 
              className={`${data.children.length > 0 
                              ? styles.FolderContinuityLine_NoChildPadding 
                              : `${styles.FolderContinuityLine} 
                                  ${styles.FolderContinuityLine_ChildPadding}`} 
                                  ${isDragging && styles.FolderTree_Dragging}`}>
          {data.children.length > 0 && 
              <i className={`${styles.ExpanderBase} bi ${isExpanded ? "bi-chevron-down" : "bi-chevron-right"}`} 
                  onClick={toggleDropdownEvent} />
          }
          <a ref={el=>{drop(el)}} 
              className={`${styles.FolderName} 
                          ${selectedFolderState === data.id && styles.Foldername_Selected} 
                          ${isOver && (canDrop ? styles.FolderTree_Droppable : styles.FolderTree_NotDroppable)}`} 
              onClick={() => selectFolderFunc(data.id)}>
              <span ref={el=>{preview(el)}}>{data.name}</span>
          </a>
          <div className={isExpanded ? styles.FolderContinuityLine : "d-none"}>
              <ul className={styles.ChildList}>
                  {data.children.map((child: FolderItem) => (
                      <li key={child.id}>
                          <FolderTreeItemView data={child} 
                                              selectFolderFunc={selectFolderFunc} 
                                              selectedFolderState={selectedFolderState}/>
                      </li>
                  ))}
              </ul>
          </div>
      </div>
      </>
    );
}