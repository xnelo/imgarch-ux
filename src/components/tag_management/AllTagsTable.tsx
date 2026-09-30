'use client'

import { FilearchTag } from "@/filearch_api/tag";
import styles from "./TagManagement.module.css"
import { use, useState } from "react";
import DeleteTagButton from "./DeleteTagButton";

export default function AllTagsTable({allTags}:{allTags:Promise<FilearchTag[] | null>}) {

  const [tags, setTags] = useState<FilearchTag[]|null>(use(allTags));

  const onDeleteCallback = (tagId:number):void => {
    setTags(prevData => {
      const tmpTags = prevData?.filter(t=>t.id != tagId);
      if (tmpTags === undefined) {
        return null;
      } else {
        return tmpTags;
      }
    });
  };

  return (
    <div className={styles.TagManagement_TagsTable}>
      <table>
        <thead>
        <tr><th>ID</th><th>Name</th><th>Delete</th></tr>
        </thead>
        <tbody>
        {tags?.map(t=>
          <tr key={t.id}>
            <td>{t.id}</td>
            <td><a href={`/images/tags/${t.id}/`}>{t.tag_name}</a></td>
            <td><DeleteTagButton tagId={t.id} onDeleteCallback={onDeleteCallback}/></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  );
}