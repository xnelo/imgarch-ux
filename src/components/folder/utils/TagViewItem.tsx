import toast from "react-hot-toast";
import styles from "./FolderUtils.module.css";
import { RemoveTagFromFile } from "./actions/TagActions";

export interface TagItem {
  id: number;
  tagName: string;
}

export default function TagViewItem({ tagItem, fileOn, tagRemovedCallback }: { tagItem: TagItem, fileOn: number | undefined, tagRemovedCallback: (tagId: number) => void }) {
  function handleRemoveTag() {
    if (fileOn === undefined) {
      toast.error("No file selected to remove tag from. Please contact support.");
      return;
    }

    RemoveTagFromFile(tagItem.id, fileOn).then((result: boolean) => {
      if (result) {
        toast.success("Tag '" + tagItem.tagName + "' removed from file.");
        tagRemovedCallback(tagItem.id);
      } else {
        toast.error("Failed to remove tag '" + tagItem.tagName + "' from file. Please try again.");
      }
    }).catch((error: any) => {
      toast.error("Error removing tag '" + tagItem.tagName + "' from file: " + error.message);
    });
  }

  return (
    <span data-tag-id={tagItem.id}
      className={`badge rounded-pill text-bg-primary me-2 ${styles.folderView_tag}`}>
      {tagItem.tagName}
      <a data-tag-id={tagItem.id}
        onClick={handleRemoveTag}>
        <i className="bi bi-x-circle" style={{fontSize:'0.95em'}}></i>
      </a>
    </span>
  );
}