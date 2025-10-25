import logger from "@/lib/logger";
import { ActionResponse, ActionType, FilearchAPIResponse, ResourceType } from "./FilearchAPI";

export async function MakeAPICall<T>(url: string, init: RequestInit, resource: ResourceType, action: ActionType) : Promise<ActionResponse<T>[]> {
  try {
        const response = await fetch(url, init);
        
        try {
            const data: FilearchAPIResponse<T> = await response.json();
            return data.action_responses;
        } catch (responseJsonError) {
            logger.error("Error getting json response from API call. url={} error={}", url, responseJsonError);
            return [
                {
                    type:resource, 
                    action:action, 
                    data:null,
                    errors: [
                        {
                            error_code: 1000, 
                            error_message:"No JSON response from calling url=" + url, 
                            http_code:response.status
                        }
                    ]
                }
            ];
        }
    } catch (error) {
        logger.error("Error making API call. url={} error={} ", url, error);
        return [
            {
                type: resource,
                action: action,
                data: null,
                errors: [
                    {
                        error_code: 500, 
                        error_message: "Error making API call.", 
                        http_code: 500
                    }
                ]
            }
        ];
    }
}