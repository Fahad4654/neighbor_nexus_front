'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function UserNav() {
    return (
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
    )
}
