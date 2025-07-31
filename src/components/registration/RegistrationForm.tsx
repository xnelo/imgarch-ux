"use client"

import { useActionState} from "react";
import Username from "./Username";
import RegistrationCancel from "./RegistrationCancel";
import { SubmitRegistrationForm } from "@/app/registration/actions";

interface RegistrationFormProps {
    first_name: string;
    last_name: string;
    email: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({first_name, last_name, email}) => {
    
  const [actionState, formAction] = useActionState(SubmitRegistrationForm, {message:''})

    return (
        <div>
            <p>ErrorMessage: {actionState.message}</p>
            <form action={formAction}>
                <input name="first_name" type="text" value={first_name} readOnly/>
                <input name="last_name" type="text" value={last_name} readOnly/>
                <input name="email" type="text" value={email} readOnly/>
                <Username username={actionState.payload !== undefined ? actionState.payload.get("registration_username")?.toString() : undefined}/>
                <button type="submit">Register</button> 
                <RegistrationCancel />
            </form>
        </div>
    );
}

export default RegistrationForm;

