import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Sign In - Guru Upadesh',
  description: 'Sign in to your Guru Upadesh account',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
