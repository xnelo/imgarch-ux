"use client"

import { useActionState} from "react";
import Username from "./Username";
import { SubmitRegistrationForm } from "@/app/registration/actions";

interface RegistrationFormProps {
    first_name: string;
    last_name: string;
    email: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({first_name, last_name, email}) => {
    
    const [actionState, formAction] = useActionState(SubmitRegistrationForm, {message:''});

    return (
        <div>
            <p className={actionState.message === '' ? 'invisible' : 'visible'}>ErrorMessage: {actionState.message}</p>
            <form action={formAction}>
                <div className='mb-3'>
                    <label className='form-label' htmlFor="txtFirstName">First Name</label>
                    <input className='form-control' id="txtFirstName" name="first_name" type="text" value={first_name} readOnly/>
                </div>
                <div className='mb-3'>
                    <label className='form-label' htmlFor="txtLastName">Last Name</label>
                    <input className='form-control' id="txtLastName" name="last_name" type="text" value={last_name} readOnly/>
                </div>
                <div className='mb-3'>
                    <label className='form-label' htmlFor="txtEmail">Email</label>
                    <input className='form-control' id="txtEmail" name="email" type="text" value={email} readOnly/>
                </div>
                <div className='mb-3'>
                    <label className='form-label' htmlFor="txtUsername" >Username</label>
                    <Username username={actionState.payload !== undefined ? actionState.payload.get("registration_username")?.toString() : undefined}/>
                </div>
                <div className='row justify-content-center'>
                    <button className='btn btn-primary col-3' type="submit">Register</button> 
                    <button className='btn btn-secondary col-3 offset-md-1' type="button" onClick={() => {window.location.href = '/auth/logout'}}>Cancel</button>
                </div>
            </form>
        </div>
    );
}

export default RegistrationForm;

