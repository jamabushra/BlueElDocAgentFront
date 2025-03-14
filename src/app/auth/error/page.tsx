'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration. Please try again later.';
      case 'AccessDenied':
        return 'Access denied. You do not have permission to access this resource.';
      case 'Verification':
        return 'The verification link may have expired or has already been used.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-2">Authentication Error</h1>
          <p className="text-lg text-gray-600 mb-8">{getErrorMessage(error)}</p>
        </div>
        <div className="flex flex-col gap-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">Try Again</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 