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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      const loggedInUser = getLoggedInUser();
      if (!loggedInUser) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for storage changes to handle logout from other tabs
    window.addEventListener('storage', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
    };
  }, [router]);

  if (loading) {
    return <Loading />;
  }

  return <AppShell>{children}</AppShell>;
}
