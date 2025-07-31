import RegistrationForm from '@/components/registration/RegistrationForm';
import { getSession } from '@/lib';

export default async function Registration() {
  const session = await getSession();
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
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
