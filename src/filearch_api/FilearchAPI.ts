export enum ResourceType {
  USER,
  FILE,
  FILE_IDS,
  FOLDER,
  TAG,
  USERNAME, 
  GROUP
}

export enum ActionType {
  CREATE,
  UPLOAD,
  UPDATE,
  GET,
  DELETE,
  DOWNLOAD,
  ASSIGN,
  UNASSIGN,
  SEARCH,
  ADD_USER_TO_GROUP,
  REMOVE_USER_FROM_GROUP,
  ACCEPT_GROUP_INVITE,
  ADD_ITEM_TO_GROUP,
  REMOVE_ITEM_FROM_GROUP,
  GET_GROUP_PERMISSIONS,
  MODIFY_GROUP_PERMISSIONS
}

export enum StorageType {
  UNKNOWN,
  LOCAL_FILE_SYSTEM,
  S3
}

export enum SortDirection {
  ASCENDING = "ASCENDING",
  DESCENDING = "DESCENDING"
}

export enum GroupItemType {
  FOLDER = 'FOLDER',
  FILE = 'FILE'
}

export enum FilearchGroupMembershipType {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export enum FilearchGroupPermissionType {
  UNKNOWN = 'UNKNOWN',
  ADMIN = 'ADMIN',
  ADD_MEMBERS = 'ADD_MEMBERS',
  REMOVE_MEMBERS = 'REMOVE_MEMBERS',
  EDIT_MEMBER_PERMISSIONS = 'EDIT_MEMBER_PERMISSIONS',
  ADD_ITEMS = 'ADD_ITEMS',
  REMOVE_ITEMS = 'REMOVE_ITEMS',
  TAG_ITEMS = 'TAG_ITEMS',
  REMOVE_TAGS = 'REMOVE_TAGS'
}

export interface FilearchAPI_IdObject{
  id: number;
}

export interface PaginationContract<T> {
  data: T[] | null;
  has_next: boolean;
}

export interface ErrorResponse{
  error_code: number;
  error_message: string | null;
  http_code: number;
}

export interface ActionResponse<T> {
    type: ResourceType;
    action: ActionType;
    data: T | null;
    errors: ErrorResponse[] | null;
}

export interface FilearchAPIResponse<T> {
  action_responses: ActionResponse<T>[];
}

export interface FilearchFile extends FilearchAPI_IdObject {
  owner_id: number;
  folder_id: number;
  storage_type: StorageType;
  storage_key: string;
  original_filename: string;
  mime_type: string;
}

export interface FilearchGroupFile extends FilearchFile {
  item_type: GroupItemType;
  folder_in: string;
  folder_in_id: number|null;
}

export interface FilearchGroup extends FilearchAPI_IdObject {
  owner_user_id: number;
  group_name: string;
  accepted: boolean;
  group_membership_type: FilearchGroupMembershipType;
}

export interface FilearchGroupMember {
  user_id: number;
  username: string;
  group_id: number;
  accepted: boolean;
  group_member_type:FilearchGroupMembershipType;
}

export interface FilearchGroupPermission {
  user_id: number;
  group_id: number;
  permission: FilearchGroupPermissionType;
}

export interface FIlearchAllGroupPermission {
  user_id: number;
  group_id: number;
  permissions: FilearchGroupPermissionType[];
}

export interface FilearchGroupItem {
  item_id: number;
  item_type: GroupItemType;
  group_id: number;
}

export function HandleActionResponse<T>(actionResponse: ActionResponse<T>) : void {
    actionResponse.errors!.forEach((error:ErrorResponse) => {
                    console.error("Error response from API: ", error);
                });
}

export function HandleErrorResponse<T>(apiResponse: FilearchAPIResponse<T>) : void {
    apiResponse.action_responses.forEach(HandleActionResponse)
}

function aggregateErrorResponseArrays(prevVal: ErrorResponse[] | null | undefined, currVal: ErrorResponse[]|null) {
  if (prevVal === undefined || prevVal === null) {
    return [];
  } else {
    return prevVal.concat(currVal !== null ? currVal : []);
  }
}

export function AggregateErrorResponse<T>(apiResponse: FilearchAPIResponse<T>) : ErrorResponse[] {
  const res = apiResponse.action_responses
  .filter(ar=>ar.errors !== null)
  .map(ar=>ar.errors)
  .reduce(aggregateErrorResponseArrays, []);

  if (res === null) {
    return [];
  } else {
    return res;
  }
}

export function ConcatenateErrorResponse(errors:ErrorResponse[]|null): string {
  if (errors === null || errors.length <= 0) {
    return "No Errors.";
  }

  return errors
    .map(err=>err.error_message + " (" + err.error_code + ")")
    .join("\n");
}