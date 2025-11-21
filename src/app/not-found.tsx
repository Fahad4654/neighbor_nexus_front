import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4">
      <h1 className="text-8xl font-bold text-primary font-headline">404</h1>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">Page Not Found</h2>
      <p className="mt-2 text-lg text-muted-foreground">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Go back home
        </Link>
      </Button>
    </div>
  );
}
