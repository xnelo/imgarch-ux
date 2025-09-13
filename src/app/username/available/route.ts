import { IsUsernameAvailable } from "@/filearch_api/username";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const nameToCheck: string | null = request.nextUrl.searchParams.get('username');
    if (nameToCheck === null) {
        return Response.json(false);
    } else {
        const usernameAvailable: boolean = await IsUsernameAvailable(nameToCheck);
        return Response.json(usernameAvailable);
    }
}