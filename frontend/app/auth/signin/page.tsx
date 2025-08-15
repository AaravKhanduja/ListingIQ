'use client';

import { SignInForm } from '@/components/auth/SignInForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthToggle } from '@/components/auth/AuthToggle';

export default function SignInPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        <SignInForm />
        <AuthToggle isSignUp={false} />
      </div>
    </AuthLayout>
  );
}
