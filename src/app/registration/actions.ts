"use server";

import { CreateNewUser, FilearchNewUserPayload, FilearchUserData } from "@/filearch_api/user";
import { clientConfig, getSession } from "@/lib/lib";
import { redirect } from "next/navigation";

type SubmitRegistrationActionState = {
    message : string;
    payload?: FormData;
}

export async function SubmitRegistrationForm(prevState: SubmitRegistrationActionState, formData: FormData) : Promise<SubmitRegistrationActionState>{
    const firstName: string | undefined = formData.get("first_name")?.toString();
    const lastName: string | undefined = formData.get("last_name")?.toString();
    const email: string | undefined = formData.get("email")?.toString();
    const username: string | undefined = formData.get("registration_username")?.toString();

    const payload : FilearchNewUserPayload = {
        first_name: firstName!,
        last_name: lastName!,
        username: username!,
        email: email!
    };
    console.log("payload for create User: ", payload);

    const session = await getSession()

    const newUserInfo: FilearchUserData | null = await CreateNewUser(session.access_token!, payload);
    if (newUserInfo === null) {
        console.error("unable to create new user... try again.");
        return {message: "unable to create new user... try again.", payload: formData};
    } else { 
        session.userInfo!.registration_info = {
            user_id: newUserInfo.id,
            username: newUserInfo.username,
            root_folder_id: newUserInfo.root_folder_id
            };
        await session.save();
        redirect(clientConfig.post_login_route);
    }
}