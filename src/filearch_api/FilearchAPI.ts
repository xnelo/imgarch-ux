export enum ResourceType {
  USER,
  FILE,
  FOLDER,
  USERNAME
}

export enum ActionType {
  CREATE,
  UPLOAD,
  UPDATE,
  GET,
  DELETE,
  DOWNLOAD
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
