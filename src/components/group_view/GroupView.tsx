'use client'

import { FilearchGroup } from "@/filearch_api/group";
import { Suspense, use, useState } from "react";

export default function GroupView({groups}:{groups: Promise<FilearchGroup[]|null>}) {
  const tmpAllGroups = use(groups);
    if (tmpAllGroups === null) {
      return (
        <div>ERROR LOADING GROUPS!</div>
      );
    }

  let [allGroups, setAllGroups] = useState<FilearchGroup[] | null>(tmpAllGroups);

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
            <span>TOOLS</span>
          </div>
          <div className='position-absolute overflow-y-scroll overflow-x-scroll'
              style={{
                width: 'calc(25vw - 1.05rem)',
                height: 'calc(100vh - 8.75rem)'
              }}>
            <div>
              <Suspense fallback={<div>Loading...</div>}>
                {(allGroups === null) 
                  ? <div>NO DATA</div>
                  : <ul>{allGroups.map(i => <li key={i.id}>{i.group_name}</li>)}</ul>
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