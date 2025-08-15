'use client';

import Link from 'next/link';

interface AuthToggleProps {
  isSignUp: boolean;
}

export function AuthToggle({ isSignUp }: AuthToggleProps) {
  return (
    <div className="text-center mt-6">
      <p className="text-slate-600">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <Link
          href={isSignUp ? '/auth/signin' : '/auth/signup'}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {isSignUp ? 'Sign in' : 'Sign up'}
        </Link>
      </p>
    </div>
  );
}
