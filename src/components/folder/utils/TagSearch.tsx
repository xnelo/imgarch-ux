import { FocusEventHandler, FormEvent, useRef, useState } from "react";
import { AddNewTag, AddTagToFile, SearchTags } from "./actions/TagActions";
import { FilearchTag } from "@/filearch_api/tag";
import toast from "react-hot-toast";

export default function TagSearch({fileId}: {fileId: number | undefined}) {
  const [isAddTagEnabled, setIsAddTagEnabled] = useState(false);
  const [tagsInList, setTagsInList] = useState<FilearchTag[]>([]);
  const [currentInputTag, setCurrentInputTag] = useState<string>('');
  const [selectedTagId, setSelectedTagId] = useState<number|null>(null);

  async function searchTagChanged(event : FormEvent<HTMLInputElement>) {
    const currentInput = event.currentTarget.value;
    setCurrentInputTag(currentInput);

    // TODO: Add an isBlank() function check
    if (currentInput === '') {
      setIsAddTagEnabled(false);
    } else {
      setIsAddTagEnabled(true);
      const currentSelectedOptionId : number | null = getCurrentOptionInDataList(currentInput);
      setSelectedTagId(currentSelectedOptionId);
      if (currentSelectedOptionId === null) {
        const foundTags: FilearchTag[] | null = await SearchTags(currentInput);
        if (foundTags === null) {
          setTagsInList([]);
        } else {
          setTagsInList(foundTags);
        }
      }
    }
  }

  function getCurrentOptionInDataList(inputValue :string) : number | null {
    for (const tag of tagsInList) {
      if (tag.tag_name === inputValue) {
        return tag.id;
      }
    }
    return null;
  }

  async function addTagButtonClicked() {
    if (fileId === undefined) {
      toast.error("No file selected to add tag to. Please contact support.");
      return;
    }

    let tagIdToUse : number = -1;

    if (selectedTagId === null) { 
      alert("Adding new tag to system: " + currentInputTag);
      const newTag = await AddNewTag(currentInputTag);
      if (newTag === null) {
        toast.error("Error adding new tag. Please contact support.");
        setCurrentInputTag('');
        setIsAddTagEnabled(false);
        return;
      }
      setTagsInList(prev => [...prev, newTag]);
      setSelectedTagId(newTag.id);
      tagIdToUse = newTag.id;
    } else {
      tagIdToUse = selectedTagId;
    }
    
    alert("Adding tag: " + currentInputTag + " (" + tagIdToUse + ") to file id: " + fileId);
    const addTagResult = await AddTagToFile(tagIdToUse, fileId);
    if (!addTagResult) {
      toast.error("Error adding tag to file. Please contact support.");
      return;
    } else {
      toast.success("Tag added to file.");
    }
    setCurrentInputTag('');
    setIsAddTagEnabled(false);
  }

  return (
    <div className="input-group">
      <input list="search-tag" className="form-control" type="text" placeholder="tags" autoComplete="off" onChange={searchTagChanged} value={currentInputTag}/>
      <datalist id="search-tag">
        {tagsInList.map((tag:FilearchTag)=><option key={tag.id} value={tag.tag_name}/>)}
      </datalist>
      <button className="btn btn-outline-secondary" type="button" id="add-tag" disabled={!isAddTagEnabled} onClick={addTagButtonClicked}>+</button>
    </div>
  );
}