import logger from "@/lib/logger";
import { ActionResponse, ActionType, ErrorResponse, FilearchAPI_IdObject, FilearchAPIResponse, PaginationContract, ResourceType, SortDirection } from "./FilearchAPI";

export function logActionResponseErrors<T>(actionResponse: ActionResponse<T>):void {
  actionResponse.errors!.forEach((error:ErrorResponse)=>
    {
      logger.error(error.error_message + 
        " error_code=" + error.error_code + 
        " http_code=" + error.http_code);
    });
}

export async function GetAllPaginatedData<T extends FilearchAPI_IdObject>(accessToken:string, url:string, sortDirection:SortDirection, limit:number, resourceType: ResourceType): Promise<T[] | null> {
  let outputData: T[] = [];
  let hasMoreData : boolean = true;
  let after : number | null = null;
  while(hasMoreData) {
    const paginationCall: ActionResponse<PaginationContract<T>> | null = 
      await SinglePaginatedCall(accessToken, url, after, sortDirection, limit, resourceType);

    if (paginationCall === null) {
      logger.error("Error during a pagination call; URL=" + url);
      return null;
    }

    // append data array to output array
    if (paginationCall.data === null || paginationCall.data.data === null) {
      logger.error("The returned data from pagination call was null");
      return null;
    } else if (paginationCall.errors !== null) {
      logActionResponseErrors(paginationCall);
      return null;
    } else if (!Array.isArray(paginationCall.data.data)) {
      logger.error("The returned data from pagination call was not an array.");
      return null;
    } else { 
      paginationCall.data.data.forEach((dataItem:T) => {
        after = dataItem.id;
        outputData.push(dataItem);
      });
    }

    hasMoreData = paginationCall.data.has_next;
  }

  return outputData;
}

export async function SinglePaginatedCall<T>(
  accessToken:string,
  url:string,
  after:number | null,
  sortDirection:SortDirection,
  limit:number,
  resourceType:ResourceType,
  additionalUrlParams?:[string, string][]) : Promise<ActionResponse<PaginationContract<T>>> {
    
  // create the final URL
  let searchParams : URLSearchParams = new URLSearchParams();
  if (after !== null) {
      searchParams.append("after", after.toString());
  }
  searchParams.append("direction", sortDirection.toString());
  searchParams.append("limit", limit.toString());

  if (additionalUrlParams !== undefined && additionalUrlParams.length > 0) {
    additionalUrlParams.forEach((param:[string, string]) => {
      searchParams.append(param[0], param[1]);
    });
  }

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