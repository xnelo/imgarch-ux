'use client'

import toast from "react-hot-toast";
import { DeleteTag } from "./actions/TagActions";
import styles from "./TagManagement.module.css"

export default function DeleteTagButton({tagId, onDeleteCallback}:{tagId:number, onDeleteCallback:(tagId:number)=>void}) {
  const deleteTag = async () => {
    
    const tagDeleted:boolean = await DeleteTag(tagId);

    if (tagDeleted) {
      toast.success("Tag successfully deleted ("+ tagId +")");
      onDeleteCallback(tagId);
    } else {
      toast.error("Unable to delete tag (" + tagId + ")");
    }
  };

  return (
    <a onClick={deleteTag} className={styles.TagDeleteButton}><i className="bi bi-trash3-fill"></i></a>
  );
} 