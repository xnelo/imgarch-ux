'use client'

import { FormEvent, useState } from "react";

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
                const response = await fetch("/username/available?username=" + inputValue,
                {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json'
                    }
                });
            
                if (response.status != 200) {
                    console.error('Error while validating username is available. status=', response.status)   
                } else {
                    const isUsernameAvailable = await response.json();
                    console.info('is username available: ', isUsernameAvailable);
                    setIsValid(isUsernameAvailable);
                }
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