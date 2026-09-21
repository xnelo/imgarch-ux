'use client'

import { FilearchGroup } from "@/filearch_api/FilearchAPI";
import { SetStateAction, use, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styles from "./TagGroups.module.css";
import { ShareTagWithGroup, UnShareTagWithGroup } from "./actions/TagSharingActions";

enum DragTypes {
    GROUP_IN = 'groupIn',
    GROUP_AVAILABLE = 'groupAvailable'
}

interface GroupInfo {
  id: number;
  group_name: string;
  drag_type: DragTypes;
  is_moving: boolean;
}

class GroupInfoImpl implements GroupInfo {
  id: number;
  group_name: string;
  drag_type: DragTypes;
  is_moving: boolean;
  
  constructor(id:number, group_name: string, drag_type: DragTypes, is_moving:boolean) {
    this.id = id;
    this.group_name = group_name;
    this.drag_type = drag_type;
    this.is_moving = is_moving;
  }
}

function GroupViewItem({groupInfo}:{groupInfo:GroupInfo}) {
  const [, drag] = useDrag(
    () => ({
      type: groupInfo.drag_type,
      item: groupInfo,
      canDrag: () => groupInfo.is_moving === false
    }), [groupInfo]
  );

  return (
    <li ref={el=>{drag(el)}} className={styles.TagGroupItem}>{groupInfo.group_name} ({groupInfo.id}) {groupInfo.is_moving && <span>[moving]</span>}</li>
  );
}

function GroupDroppable({groupsToDisplay, acceptType, dropCallback}:{groupsToDisplay:GroupInfo[], acceptType:DragTypes, dropCallback:(groupInfo:GroupInfo)=>void}){
  const [{isOver, canDrop}, drop] = useDrop(
      () => ({
        accept: acceptType,
        drop: dropCallback,
        collect: (monitor) => ({
          isOver: !!monitor.isOver(),
          canDrop: !!monitor.canDrop()
        })
      })
    );

  return (
    <ul ref={el=>{drop(el)}} className={styles.TagGroupColumnCommon}>
      {groupsToDisplay?.map(g=><GroupViewItem key={`gi${g.id}`} groupInfo={g} />)}
    </ul>
  );
}

export default function TagGroupView({ tagId, groupsUserIn, idOfGroupsTagIn}: {tagId: number, groupsUserIn:Promise<FilearchGroup[] | null>, idOfGroupsTagIn:Promise<number[]>}) {

  const groups:FilearchGroup[] | null = use(groupsUserIn)
  const groupsTagIn:number[] = use(idOfGroupsTagIn);

  if (groups === null) {
    return (<h1>ERROR!</h1>);
  }

  const [groupsToDisplay, setGroupsToDisplay] = useState<GroupInfo[]>(
    groups
    .filter(g=>!groupsTagIn.includes(g.id))
    .map(groupIn=>new GroupInfoImpl(groupIn.id, groupIn.group_name, DragTypes.GROUP_AVAILABLE, false))
  );
  const [groupsTagInToDisplay, setGroupsTagInToDisplay] = useState<GroupInfo[]>(
    groups
    .filter(g=>groupsTagIn.includes(g.id))
    .map(groupIn=> new GroupInfoImpl(groupIn.id, groupIn.group_name, DragTypes.GROUP_IN, false))
  );

  function moveGroupToGroupsToDisplay(groupInfo:GroupInfo, isMoving?:boolean) : void {
    const newGroupItem:GroupInfoImpl = new GroupInfoImpl(groupInfo.id, groupInfo.group_name, DragTypes.GROUP_AVAILABLE, isMoving === undefined ? true : isMoving);
    setGroupsTagInToDisplay(prevData => prevData.filter(g=>g.id != groupInfo.id));
    setGroupsToDisplay(prevData => [...prevData, newGroupItem]);
  }

  function moveGroupToGroupsTagInToDisplay(groupInfo:GroupInfo, isMoving?:boolean): void {
    const newGroupItem:GroupInfoImpl = new GroupInfoImpl(groupInfo.id, groupInfo.group_name, DragTypes.GROUP_IN, isMoving === undefined ? true : isMoving);
    setGroupsToDisplay(prevData => prevData.filter(g=>g.id != groupInfo.id));
    setGroupsTagInToDisplay(prevData => [...prevData, newGroupItem]);
  }

  function updateItemMovingProperty(groupToAlter:(value:SetStateAction<GroupInfo[]>)=>void, id:number, is_moving:boolean):void {
    groupToAlter(prevData => prevData.map(g=>g.id === id ? new GroupInfoImpl(g.id, g.group_name, g.drag_type, is_moving) : g));
  }

  async function unshareDropCallback (groupInfo:GroupInfo) {
    alert("UN-Sharing tag (" + tagId + ") with " + groupInfo.id);

    moveGroupToGroupsToDisplay(groupInfo);

    const unShareRes : boolean = await UnShareTagWithGroup(tagId, groupInfo.id);

    await new Promise((resolve) => setTimeout(resolve, 5000)); //TODO: Remove when moving UI done

    if (unShareRes) {
      updateItemMovingProperty(setGroupsToDisplay, groupInfo.id, false);
    } else {
      moveGroupToGroupsTagInToDisplay(groupInfo, false);
    }
  };

  async function shareDropCallback (groupInfo:GroupInfo) {
    alert("Sharing tag (" + tagId + ") with " + groupInfo.id);

    moveGroupToGroupsTagInToDisplay(groupInfo);

    const shareRes : boolean = await ShareTagWithGroup(tagId, groupInfo.id);

    await new Promise((resolve) => setTimeout(resolve, 5000)); //TODO: Remove when moving UI done

    if (shareRes) {
      updateItemMovingProperty(setGroupsTagInToDisplay, groupInfo.id, false);
    } else {
      moveGroupToGroupsToDisplay(groupInfo, false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container">
        <div className="row">
          <div className={`col ${styles.TagGroupAvailableColumn}`}>
            <h3>Groups Available</h3>
            <GroupDroppable groupsToDisplay={groupsToDisplay} acceptType={DragTypes.GROUP_IN} dropCallback={unshareDropCallback}/>
          </div>
          <div className={`col ${styles.TagGroupInColumn}`}>
            <h3>Groups Shared With</h3>
            <GroupDroppable groupsToDisplay={groupsTagInToDisplay} acceptType={DragTypes.GROUP_AVAILABLE} dropCallback={shareDropCallback}/>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}