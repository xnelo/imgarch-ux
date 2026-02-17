'use server'

import { AddFolder, DeleteFolder, MoveFolder, RenameFolder } from "@/filearch_api/folder";
import { getSession } from "@/lib/lib";
import logger from "@/lib/logger";

export async function RenameFolderAction(new_folder_name: string, folderId: number) {
  logger.debug("Renaming folder with id " + folderId + " to new name: " + new_folder_name);
  
  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return null;
  }

  return await RenameFolder(session.access_token, folderId, new_folder_name);
}

export async function MoveFolderAction(folderId: number, new_parent_id: number) {
  logger.debug("Moving folder with id " + folderId + " to new parent id: " + new_parent_id);

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return null;
  }

  return await MoveFolder(session.access_token, folderId, new_parent_id);
}

export async function DeleteFolderAction(folderId: number) {
  logger.debug("Deleting folder with id " + folderId);

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return null;
  }

  return await DeleteFolder(session.access_token, folderId);
}

export async function AddFolderAction(folder_name: string, parent_id: number) { 
  logger.debug("Adding folder with name " + folder_name + " to parent id: " + parent_id);

  const session = await getSession();
  if (session.access_token === undefined) {
    logger.error("Error getting access token for session.");
    return null;
  }

  return await AddFolder(session.access_token, folder_name, parent_id);
}