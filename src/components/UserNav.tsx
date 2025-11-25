
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
import { getLoggedInUser, logout } from '@/lib/auth';
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
  const [user, setUser] = useState<User | null>(getLoggedInUser);
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const updateUserState = () => {
      const loggedInUser = getLoggedInUser();
      setUser(loggedInUser);
    };

    updateUserState();

    // Listen for changes in localStorage (e.g., after login/logout)
    window.addEventListener('storage', updateUserState);
    return () => {
      window.removeEventListener('storage', updateUserState);
    };
  }, []);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (user && user.avatarUrl) {
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
              // If fetching fails, fall back to the vercel avatar
              setAvatarSrc(`https://avatar.vercel.sh/${user.username}.png`);
            }
          } catch (error) {
            console.error('Failed to fetch avatar:', error);
            setAvatarSrc(`https://avatar.vercel.sh/${user.username}.png`);
          }
        } else {
           // Fallback if no token or backend URL
           setAvatarSrc(`https://avatar.vercel.sh/${user.username}.png`);
        }
      } else if (user?.username) {
        // Fallback if no avatarUrl
        setAvatarSrc(`https://avatar.vercel.sh/${user.username}.png`);
      } else {
        setAvatarSrc(undefined);
      }
    };
    
    fetchAvatar();

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
    // Notify other components that user has logged out
    window.dispatchEvent(new Event('storage')); 
    router.push('/login');
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
