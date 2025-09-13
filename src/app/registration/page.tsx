import RegistrationForm from '@/components/registration/RegistrationForm';
import { getSession } from '@/lib/lib';

export default async function Registration() {
  const session = await getSession();
  return (
    <main>
      <div style={{marginTop: '15vh', width: '33vw', marginLeft: '33vw'}}>
        <h1>
            REGISTRATION PAGE
        </h1>
        <RegistrationForm 
          first_name={session.userInfo!.first_name}
          last_name={session.userInfo!.last_name}
          email={session.userInfo!.email}
        />
      </div>
    </main>
  );
}
