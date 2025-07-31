import { access } from "fs";
import { ErrorResponse, ActionResponse, FilearchAPIResponse } from "./FilearchAPI";

export interface FilearchUserData {
    id: number,
    first_name: string,
    last_name: string,
    username: string,
    email: string,
    root_folder_id: number
}

export interface FilearchNewUserPayload {
    first_name: string,
    last_name: string,
    username: string,
    email: string
}

export async function GetUserInfo(accessToken: String): Promise<FilearchUserData | null> {
    try{
        const response = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/user",
        {
            method : 'GET',
            headers : {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        });
        if (response.status == 404) {
            return null;
        }

        const data = await response.json();
        return data.action_responses[0].data;
    } catch (error) {
        console.error('Error :', error);
        return null;
    }
}

function HandleActionResponse<T>(actionResponse: ActionResponse<T>) : void {
    actionResponse.errors!.forEach((error:ErrorResponse) => {
                    console.error("Error response from API: ", error);
                });
}

function HandleErrorResponse<T>(apiResponse: FilearchAPIResponse<T>) : void {
    apiResponse.action_responses.forEach(HandleActionResponse)
}

export async function CreateNewUser(accessToken: string, payload: FilearchNewUserPayload): Promise<FilearchUserData | null> {
    try{
        const bodyString : string = JSON.stringify(payload);
        console.log("JSON Payload: ", bodyString);
        const response = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/user",
            {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                },
                body: bodyString
            }
        );

        const data = await response.json();

        if (response.status != 200) {
            console.error("Error making call to 'create new user': ", response.status);
            HandleErrorResponse(data);
            return null;
        }

        const actionResponse: ActionResponse<FilearchUserData> = data.action_responses[0];
        return actionResponse.data;
    } catch (error) {
        console.error('error calling \'create new user\':', error);
        return null;
    }
}