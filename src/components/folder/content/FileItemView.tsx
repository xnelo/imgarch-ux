'use client'

import { Card } from "react-bootstrap";
import { FileItem } from "./FileItem";

export default function FileItemView({fileData} : {fileData: FileItem}) {
  return (
    <Card className="text-white bg-primary m-2" style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title className="text-center">
          <i className="bi bi-image" style={{fontSize:"8em"}}></i>
        </Card.Title>
        <Card.Text className="text-center">
          {fileData.id}<br/>
          {fileData.originalFilename}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}