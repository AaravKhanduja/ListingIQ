'use client';

import { SignUpForm } from '@/components/auth/SignUpForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthToggle } from '@/components/auth/AuthToggle';

export default function SignUpPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        <SignUpForm />
        <AuthToggle isSignUp={true} />
      </div>
    </AuthLayout>
  );
}
