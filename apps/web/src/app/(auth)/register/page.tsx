import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Create Account - Guru Upadesh',
  description: 'Create your Guru Upadesh account',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}
