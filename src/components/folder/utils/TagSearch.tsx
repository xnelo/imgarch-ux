import { FormEvent, useState } from "react";
import { AddNewTag, AddTagToFile, SearchTags } from "./actions/TagActions";
import { FilearchTag } from "@/filearch_api/tag";
import toast from "react-hot-toast";

export default function TagSearch({fileId, tagAddedCallback}: {fileId: number | undefined, tagAddedCallback: (tag: FilearchTag) => void}) {
  const [isAddTagEnabled, setIsAddTagEnabled] = useState(false);
  const [tagsInList, setTagsInList] = useState<FilearchTag[]>([]);
  const [currentInputTag, setCurrentInputTag] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<FilearchTag | null>(null);

  async function searchTagChanged(event : FormEvent<HTMLInputElement>) {
    const currentInput = event.currentTarget.value;
    setCurrentInputTag(currentInput);

    // TODO: Add an isBlank() function check
    if (currentInput === '') {
      setIsAddTagEnabled(false);
    } else {
      setIsAddTagEnabled(true);
      const currentSelectedOption : FilearchTag | null = getCurrentOptionInDataList(currentInput);
      setSelectedTag(currentSelectedOption);
      if (currentSelectedOption === null) {
        const foundTags: FilearchTag[] | null = await SearchTags(currentInput);
        if (foundTags === null) {
          setTagsInList([]);
        } else {
          setTagsInList(foundTags);
        }
      }
    }
  }

  function getCurrentOptionInDataList(inputValue :string) : FilearchTag | null {
    for (const tag of tagsInList) {
      if (tag.tag_name === inputValue) {
        return tag;
      }
    }
    return null;
  }

  async function addTagButtonClicked() {
    if (fileId === undefined) {
      toast.error("No file selected to add tag to. Please contact support.");
      return;
    }

    let tagToUse : FilearchTag | null = null;

    if (selectedTag === null) { 
      // need to add new tag
      const newTag = await AddNewTag(currentInputTag);
      if (newTag === null) {
        toast.error("Error adding new tag. Please contact support.");
        setCurrentInputTag('');
        setIsAddTagEnabled(false);
        return;
      } else {
        toast.success("New tag added " + currentInputTag + " to system.");
      }
      setTagsInList(prev => [...prev, newTag]);
      setSelectedTag(newTag);
      tagToUse = newTag;
    } else {
      // use the currently selected tag
      tagToUse = selectedTag;
    }
    
    // now add the tag to the file
    const addTagResult = await AddTagToFile(tagToUse.id, fileId);
    if (!addTagResult) {
      toast.error("Error adding tag to file. Please contact support.");
      return;
    } else {
      toast.success("Tag added to file.");
      tagAddedCallback(tagToUse);
    }
    // reset input and add button
    setCurrentInputTag('');
    setIsAddTagEnabled(false);
  }

  return (
    <div className="input-group">
      <input list="search-tag" className="form-control" type="text" placeholder="tag name" autoComplete="off" onChange={searchTagChanged} value={currentInputTag}/>
      <datalist id="search-tag">
        {tagsInList.map((tag:FilearchTag)=><option key={tag.id} value={tag.tag_name}/>)}
      </datalist>
      <button className="btn btn-primary" type="button" id="add-tag" disabled={!isAddTagEnabled} onClick={addTagButtonClicked}><i className="bi bi-plus"></i></button>
    </div>
  );
}