'use client'

import { FormEvent } from "react";

interface UsernameProps {
    username: string|undefined
}

const Username: React.FC<UsernameProps> = ({username}) => {

    async function input(event : FormEvent<HTMLInputElement>) {
        const inputValue : string = event.currentTarget.value;
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
                const isAvailable = await response.json();
                console.info('is username available: ', isAvailable);
            }
        } catch (error) {
            console.error('Error :', error);
        }
    }

    return (
        <input type="text" name="registration_username" onInput={ input } defaultValue={username}/>
    );
}

export default Username;