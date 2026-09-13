'use client'

import { Button, Modal } from "react-bootstrap";
import { TagItem } from "./TagViewItem";
import { GetAllGroupsIn } from "./actions/GroupActions";
import { FilearchGroup } from "@/filearch_api/FilearchAPI";
import { useState } from "react";
import { GetGroupIdsTagIsSharedIn, ShareTagWithGroup, UnshareTagWithGroup } from "./actions/TagActions";
import styles from "./FileViewer.module.css";

class TagShareGroupItem {
  tagId: number;
  group: FilearchGroup;
  isShared: boolean;

  constructor(tagId:number, group:FilearchGroup, isShared:boolean) {
    this.tagId = tagId;
    this.group = group;
    this.isShared = isShared;
  }
}

export default function ShareTagModal({show, tagItemToShow, onHideCallback}:{show:boolean, tagItemToShow:TagItem|undefined, onHideCallback:()=>void}) {

  const [groupsAvailableForSharing, setGroupsAvailableForSharing] = useState<TagShareGroupItem[] | null>(null);

  const handleOnShow = async () => {
    if (tagItemToShow === undefined){
      return;
    }

    const groupsUserIn:FilearchGroup[] | null = await GetAllGroupsIn();
    if (groupsUserIn === null) {
      setGroupsAvailableForSharing(null);
      return;
    }

    const groupsTagIn:number[] = await GetGroupIdsTagIsSharedIn(tagItemToShow.id);
    const groupItems = groupsUserIn.map(g=>new TagShareGroupItem(tagItemToShow.id, g, groupsTagIn.includes(g.id)));
    
    setGroupsAvailableForSharing(groupItems);
  }

  return (
    <Modal show={show} onShow={handleOnShow} onHide={onHideCallback} style={{ zIndex: 9999 }}>
      <Modal.Header closeButton>
        <Modal.Title>Tag: {tagItemToShow?.tagName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{height:'25vh', overflow:'scroll'}}>
          <ul className={styles.sharedTags_list} style={{listStyle:'none', paddingLeft:'5px'}}>
            {groupsAvailableForSharing?.map(tgi=>
              <li key={tgi.group.id}>
                <ShareTagItemView tagItemData={tgi}/>
              </li>
            )}
          </ul>
        </div>
      </Modal.Body>
      <Modal.Footer>
          <Button variant="primary" onClick={onHideCallback}>Done</Button>
      </Modal.Footer>
    </Modal>
  );
}

export function ShareTagItemView({tagItemData}:{tagItemData:TagShareGroupItem}) {

  const [isTagShared, setIsTagShared] = useState<boolean>(tagItemData.isShared);
  const [isTagSharedUpdating, setIsTagSharedUpdating] = useState<boolean>(false);

  const shareTag = async () => {
    setIsTagSharedUpdating(true);
    const shareRes: boolean = await ShareTagWithGroup(tagItemData.tagId, tagItemData.group.id);
    tagItemData.isShared = shareRes;
    setIsTagShared(shareRes);
    setIsTagSharedUpdating(false);
  };

  const unShareTag = async () => {
    setIsTagSharedUpdating(true);
    const unshareSuccess: boolean = await UnshareTagWithGroup(tagItemData.tagId, tagItemData.group.id);
    tagItemData.isShared = !unshareSuccess;
    setIsTagShared(!unshareSuccess);
    setIsTagSharedUpdating(false);
  };

  return (
    <div>
      <span className={styles.sharedTags_listItem_groupName}>{tagItemData.group.group_name}</span>
      <span className={styles.sharedTags_listItem_shareAction}>
        {isTagSharedUpdating ? 
          <img 
            className={styles.rotate_image} 
            src="/loading.png" 
            width={25} 
            height={25} 
            style={{ 
              filter: 'invert(1) opacity(0.333)', 
              position: 'relative', 
              top: '6px',
              left: '-10px' }}/>  : 
            isTagShared ? 
            <Button size="sm" onClick={unShareTag}>Unshare</Button> : 
            <Button size="sm" onClick={shareTag}>Share</Button>
        }
      </span>
    </div>
  );
}