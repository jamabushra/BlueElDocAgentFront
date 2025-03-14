import ClientWrapper from '@/components/client-wrapper';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <ClientWrapper>
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-8">Table Extraction Tool</h1>
        <p className="text-xl mb-8">Extract tables from emails and documents with ease</p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/register">Register</Link>
          </Button>
        </div>
      </main>
    </ClientWrapper>
  );
} 