'use client'

import { Suspense, use, useState } from "react";
import GroupItemView from "./GroupItemView";
import styles from "./GroupView.module.css"
import { FilearchGroup } from "@/filearch_api/FilearchAPI";
import { Button } from "react-bootstrap";
import AddGroup from "./action_buttons/AddGroup";
import RemoveGroup from "./action_buttons/RemoveGroup";

export const NO_GROUP_SELECTED: number = -1;

function findGroupInGroups(groups:FilearchGroup[]|null, groupId:number):FilearchGroup|null {
  if (groups === null || groupId < 0){
    return null;
  }
  
  const retVal = groups.find(g=>g.id === groupId);
  if (retVal === undefined){
    return null;
  } else {
    return retVal;
  }
}

export default function GroupView({groups}:{groups: Promise<FilearchGroup[]|null>}) {
  const tmpAllGroups = use(groups);
    if (tmpAllGroups === null) {
      return (
        <div>ERROR LOADING GROUPS!</div>
      );
    }

  let [allGroups, setAllGroups] = useState<FilearchGroup[] | null>(tmpAllGroups);
  let [selectedGroup, setSelectedGroup] = useState<number>(NO_GROUP_SELECTED);
  let [selectedGroupData, setSelectedGroupData] = useState<FilearchGroup|null>(null);

  function selectGroupEvent(groupSelectedId:number):void {
    if (groupSelectedId === selectedGroup) {
      setSelectedGroup(NO_GROUP_SELECTED);
      setSelectedGroupData(null);
    } else {
      setSelectedGroup(groupSelectedId);
      setSelectedGroupData(findGroupInGroups(allGroups, groupSelectedId));
    }
  }

  function addGroupEventComplete(groupToAdd: FilearchGroup) {
    if (allGroups === null) {
      setAllGroups([groupToAdd]);
    } else {
      setAllGroups([...allGroups, groupToAdd]);
    }
  }

  function deleteGroupEventComplete(deletedGroup: FilearchGroup):void {
    if (deletedGroup === null) {
      console.debug("Group is null. Doing nothing.");
      return;
    }

    if (allGroups !== null) {
      setAllGroups(allGroups.filter(a => a.id !== deletedGroup.id));
      setSelectedGroup(NO_GROUP_SELECTED);
      setSelectedGroupData(null);
    }
  }

  return (
      <div className='container-fluid'>
        <div className="position-absolute bg-body-tertiary"
          style={{
            width: 'calc(25vw - 1rem)',
            height: 'calc(100vh - 5.75rem)',
            marginLeft: '1rem',
            paddingTop: '1rem',
            left: '0px',
            borderRight: 'var(--bs-border-color) 1px solid'
          }}>
          <div className="container">
            <AddGroup addGroupEventComplete={addGroupEventComplete}/>
            <RemoveGroup selectedGroup={selectedGroupData} deleteGroupEventComplete={deleteGroupEventComplete}/>
          </div>
          <div className='position-absolute overflow-y-scroll overflow-x-scroll'
              style={{
                width: 'calc(25vw - 1.05rem)',
                height: 'calc(100vh - 8.75rem)'
              }}>
            <div>
              <Suspense fallback={<div>Loading...</div>}>
                {(allGroups === null || allGroups.length <= 0) 
                  ? <div>NO DATA</div>
                  : <ul className={styles.GroupList}>{allGroups.map(i => <GroupItemView key={i.id} groupInfo={i} selectGroupEvent={selectGroupEvent}/>)}</ul>
                }
              </Suspense>
            </div>
          </div>
        </div>
        <div
          className='position-absolute overflow-y-noscroll'
          style={{
            width: '75vw',
            height: 'calc(100vh - 7.75rem)',
            left: '25vw'
          }}>
          <Suspense fallback={<div>Loading...</div>}>
            <span>Coming Soon</span>
          </Suspense>
        </div>
      </div>
    );
}