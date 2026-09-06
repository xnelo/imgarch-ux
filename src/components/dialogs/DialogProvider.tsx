"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Button, Modal } from "react-bootstrap";

interface DialogContextType {
  isOpen: boolean;
  dialogContent: ReactNode | null;
  dialogTitle: string | null;
  openDialog: (title:string | null, content: ReactNode) => void;
  closeDialog: () => void;
  // Types of Dialogs
  openYesNoDialog: (title:string | null, content: ReactNode, yesCallback: ()=>void) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<ReactNode | null>(null);
  const [dialogTitle, setDialogTitle] = useState<string|null>(null);

  const openDialog = (title:string|null, content: ReactNode) => {
    setDialogTitle(title);
    setDialogContent(content);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    // Timeout prevents content from disappearing during transition animations
    setTimeout(() => setDialogContent(null), 200); 
  };

  const openYesNoDialog = (title:string | null, content: ReactNode, yesCallback: ()=>void) => {
    const yesClicked = () => {
      closeDialog();
      yesCallback();
    };

    openDialog(title, 
      <div>
        {content}
        <div className="container">
          <div className="row justify-content-end">
            <Button variant="secondary" className="me-2 col-2" onClick={closeDialog}>No</Button>
            <Button variant="primary" className="col-2" onClick={yesClicked}>Yes</Button>
          </div>
        </div>
      </div>
      );
  };

  return (
    <DialogContext.Provider value={{ isOpen, dialogContent, dialogTitle, openDialog, closeDialog, openYesNoDialog }}>
      {children}
      <GlobalDialog />
    </DialogContext.Provider>
  );
}

// Custom hook for easy access across components
export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a ModalProvider");
  }
  return context;
}

// The core Dialog component layer
function GlobalDialog() {
  const { isOpen, dialogContent, dialogTitle, closeDialog } = useDialog();

  if (!isOpen && !dialogContent) return null;

  return (
    <Modal show={isOpen} onHide={closeDialog}>
      <Modal.Header closeButton>
        <Modal.Title>{dialogTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {dialogContent}
      </Modal.Body>
    </Modal>
  );
}