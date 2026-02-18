'use server'

import { IsUsernameAvailable } from "@/filearch_api/username";

export async function IsUsernameAvailableAction(username: string|null): Promise<boolean> {
    if (username === null) {
        return false;
    } else {
      return await IsUsernameAvailable(username);
    }
  }