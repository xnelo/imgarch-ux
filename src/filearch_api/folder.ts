import { Console } from "console";
import { ActionResponse, FilearchAPI_IdObject, HandleErrorResponse, PaginationContract, SortDirection } from "./FilearchAPI";
import logger from "@/lib/logger";

const FOLDERS_LIMIT_PER_REQUEST:number = 3;

export interface FilearchFolder extends FilearchAPI_IdObject {
    owner_user_id: number;
    parent_id: number;
    folder_name: string;
}

interface FilearchNewFolderPayload {
    owner_user_id: number,
    parent_id: number,
    folder_name: string
}

interface FilearchRenameFolderPayload {
    folder_name: string
}

export async function AddFolder(accessToken: string, newFolderData: FilearchNewFolderPayload) {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/folder", 
            {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newFolderData)
            });
        
            if (response.status != 200) {
                logger.error('Error while adding folder');
                HandleErrorResponse(await response.json());
                return null;
            }

            const data = await response.json();
            const actionResponse: ActionResponse<FilearchFolder> = data.action_responses[0];
            return actionResponse.data;
    } catch (error) {
        logger.error("Error adding folder: ", error);
        return null;
    }
}

export async function RenameFolder(accessToken: string, folderId: number, renameFolderData: FilearchRenameFolderPayload) {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/folder/" + folderId, 
            {
                method: 'PATCH',
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(renameFolderData)
            });
        
            if (response.status != 200) {
                logger.error('Error while renaming folder');
                HandleErrorResponse(await response.json());
                return null;
            }

            const data = await response.json();
            const actionResponse: ActionResponse<FilearchFolder> = data.action_responses[0];
            return actionResponse.data;
    } catch (error) {
        logger.error("Error renaming folder: ", error);
        return null;
    }
}

export async function GetAllFolders(accessToken:string): Promise<FilearchFolder[] | null> {
    const data: FilearchFolder[] | null = await GetAllPaginatedData<FilearchFolder>(accessToken, process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/folder", SortDirection.ASCENDING, FOLDERS_LIMIT_PER_REQUEST);
    return data;
}

async function GetAllPaginatedData<T extends FilearchAPI_IdObject>(accessToken:string, url:string, sortDirection:SortDirection, limit:number): Promise<T[] | null> {
    let outputData: T[] = [];
    let hasMoreData : boolean = true;
    let after : number | null = null;
    while (hasMoreData) {
        const paginationCall: PaginationContract<T> | null = 
        await SinglePaginatedCall(accessToken, url, after, sortDirection, limit);

        if (paginationCall === null) {
            console.error("Error during a pagination call; URL=" + url);
            return null;
        }

        // append data array to output array
        if (paginationCall.data === null) {
            console.error("The returned data from pagination call was null");
            return null;
        } else if (!Array.isArray(paginationCall.data)){
            console.error("The returned data from pagination call was not an array.");
            return null;
        } else {
            paginationCall.data.forEach((dataItem:T) => {
                after = dataItem.id;
                outputData.push(dataItem);
            });
        }

        hasMoreData = paginationCall.has_next;
    }

    return outputData;
}

async function SinglePaginatedCall<T>(
    accessToken:string,
    url:string,
    after:number | null,
    sortDirection:SortDirection,
    limit:number): Promise<PaginationContract<T> | null> {
    
    // create the final URL
    let z : URLSearchParams = new URLSearchParams();
    if (after !== null) {
        z.append("after", after.toString());
    }
    z.append("direction", sortDirection.toString());
    z.append("limit", limit.toString());

    const finalURL:string = url + `?${z.toString()}`;

    try {
        const response = await fetch(finalURL,
            {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + accessToken
                }
            });
        
        const data = await response.json();

        if (response.status != 200) {
            console.error("Error making call to "+ finalURL);
            HandleErrorResponse(data);
            return null;
        }

        const actionResponse: ActionResponse<PaginationContract<T>> = data.action_responses[0];
        return actionResponse.data;
    } catch (error) {
        console.error("Error calling " + finalURL, error);
        return null;
    }
}