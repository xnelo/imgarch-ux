import logger from "@/lib/logger";
import { ActionResponse, ActionType, ErrorResponse, FilearchAPIResponse, PaginationContract, ResourceType, SortDirection } from "./FilearchAPI";

export function logActionResponseErrors<T>(actionResponse: ActionResponse<T>):void {
  actionResponse.errors!.forEach((error:ErrorResponse)=>
    {
      logger.error(error.error_message + 
        " error_code=" + error.error_code + 
        " http_code=" + error.http_code);
    });
}

export async function SinglePaginatedCall<T>(
  accessToken:string,
  url:string,
  after:number | null,
  sortDirection:SortDirection,
  limit:number,
  resourceType:ResourceType) : Promise<ActionResponse<PaginationContract<T>>> {
    
  // create the final URL
  let searchParams : URLSearchParams = new URLSearchParams();
  if (after !== null) {
      searchParams.append("after", after.toString());
  }
  searchParams.append("direction", sortDirection.toString());
  searchParams.append("limit", limit.toString());

  const finalURL:string = url + `?${searchParams.toString()}`;

  try {
    const response = await MakeAPICall<PaginationContract<T>>(finalURL, 
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }
      },
      resourceType,
      ActionType.GET);

    return response[0];
  } catch (error) {
    logger.error("Error calling " + finalURL, error);
    return {
      type:resourceType, 
      action:ActionType.GET, 
      data:null,
      errors: [
        {
          error_code: 1001,
          error_message:"Exception occured while calling url=" + url, 
          http_code:500
        }
      ]
    };
  }
}

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