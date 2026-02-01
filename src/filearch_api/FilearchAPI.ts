export enum ResourceType {
  USER,
  FILE,
  FOLDER,
  USERNAME,
  TAG
}

export enum ActionType {
  CREATE,
  UPLOAD,
  UPDATE,
  GET,
  DELETE,
  DOWNLOAD,
  SEARCH,
  ASSIGN
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