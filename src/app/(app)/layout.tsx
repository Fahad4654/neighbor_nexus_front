'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getLoggedInUser } from '@/lib/auth';
import Loading from '@/app/loading';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) {
      router.push('/login');
    } else {
      setUser(loggedInUser);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <Loading />;
  }

  return <AppShell>{children}</AppShell>;
}
