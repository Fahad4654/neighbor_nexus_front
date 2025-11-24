'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getLoggedInUser, fetchUserProfile } from '@/lib/auth';
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
    const checkUser = async () => {
      let loggedInUser = getLoggedInUser();
      if (!loggedInUser) {
        router.push('/login');
        return;
      }

      // If user object doesn't have avatarUrl, it's likely incomplete.
      // Fetch the full profile.
      if (!loggedInUser.avatarUrl) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            const profile = await fetchUserProfile(loggedInUser.id, token);
            loggedInUser = { ...loggedInUser, ...profile };
            localStorage.setItem('user', JSON.stringify(loggedInUser));
          } catch (error) {
            console.error('Failed to refresh user profile:', error);
            // Could potentially log out user here if profile is critical
          }
        }
      }

      setUser(loggedInUser);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <Loading />;
  }

  return <AppShell>{children}</AppShell>;
}
