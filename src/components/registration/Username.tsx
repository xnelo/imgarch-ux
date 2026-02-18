'use client'

import { FormEvent, useState } from "react";
import { IsUsernameAvailableAction } from "./actions";

interface UsernameProps {
    inputId?: string
    username: string|undefined
}

const Username: React.FC<UsernameProps> = ({inputId, username}) => {

    if (inputId === undefined) {
        inputId = "txtUsername";
    }

    const [isValid, setIsValid] = useState(false);

    async function input(event : FormEvent<HTMLInputElement>) {
        const inputValue : string = event.currentTarget.value;

        if (inputValue === '') {
            setIsValid(false);
        } else {
            try {
                const UsernameAvailableResponse = await IsUsernameAvailableAction(inputValue);
            
                console.info('is username available: ', UsernameAvailableResponse);
                setIsValid(UsernameAvailableResponse);
            } catch (error) {
                console.error('Error :', error);
            }
        }
    }

    return (
        <input className={isValid ? 'form-control is-valid' : 'form-control is-invalid'} id={inputId} type="text" name="registration_username" onInput={ input } defaultValue={username}/>
    );
}

export default Username;