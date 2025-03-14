import ClientWrapper from '@/components/client-wrapper';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <ClientWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">Page not found</p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </ClientWrapper>
  );
} 