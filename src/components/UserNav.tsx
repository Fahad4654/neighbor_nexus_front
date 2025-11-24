'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getLoggedInUser, logout, fetchUserProfile } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon } from 'lucide-react';

type User = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  avatarUrl?: string;
};

export function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const updateUser = async () => {
      let loggedInUser = getLoggedInUser();
      
      if (loggedInUser) {
        if (!loggedInUser.avatarUrl) {
          const token = localStorage.getItem('accessToken');
          if (token) {
            try {
              const profile = await fetchUserProfile(loggedInUser.id, token);
              const fullUser = { ...loggedInUser, ...profile };
              localStorage.setItem('user', JSON.stringify(fullUser));
              setUser(fullUser);
            } catch (error) {
              console.error('Failed to fetch user profile:', error);
              setUser(loggedInUser);
            }
          } else {
            setUser(loggedInUser);
          }
        } else {
          setUser(loggedInUser);
        }
      }
    };

    updateUser();

    const handleStorageChange = () => {
      updateUser();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, []);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (user?.avatarUrl) {
        const token = localStorage.getItem('accessToken');
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (token && backendUrl) {
          try {
            const response = await fetch(`${backendUrl}${user.avatarUrl}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.ok) {
              const blob = await response.blob();
              const objectUrl = URL.createObjectURL(blob);
              setAvatarSrc(objectUrl);
            } else {
              // Fallback if image fetch fails
              setAvatarSrc(`https://avatar.vercel.sh/${user.username}.png`);
            }
          } catch (error) {
            console.error('Failed to fetch avatar:', error);
            setAvatarSrc(`https://avatar.vercel.sh/${user.username}.png`);
          }
        } else {
           setAvatarSrc(`https://avatar.vercel.sh/${user.username}.png`);
        }
      }
    };
    
    fetchAvatar();

    // Clean up the object URL when component unmounts or user changes
    return () => {
      if (avatarSrc && avatarSrc.startsWith('blob:')) {
        URL.revokeObjectURL(avatarSrc);
      }
    };
  }, [user]);


  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAvatarSrc(undefined);
    router.push('/login');
    router.refresh();
  };

  if (!user) {
    return (
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={avatarSrc}
              alt={user.username}
            />
            <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.firstname} {user.lastname}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
