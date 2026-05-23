'use client'

import { MouseEvent } from "react";
import styles from "./ActionButtonGeneric.module.css"

export default function ActionButtonGeneric({iconName, onClickEvent, isDisabledCheck}: {iconName:string, onClickEvent:(event:MouseEvent<HTMLElement>)=>void, isDisabledCheck?:()=>boolean | undefined}) {
  function isDisabledDefault(): boolean{
    return false;
  }

  if (isDisabledCheck === undefined) {
    isDisabledCheck = isDisabledDefault;
  }

  return (
      <button type="button" 
              className={`btn btn-outline-primary ${styles.ActionButtonSizing}`} 
              onClick={onClickEvent}
              disabled={isDisabledCheck()}>
                  <i className={`bi ${iconName} ${styles.ActionButtonIconSizing}`}/>
      </button>
  );
}