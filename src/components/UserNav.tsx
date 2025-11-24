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
  const router = useRouter();

  useEffect(() => {
    const updateUser = async () => {
      let loggedInUser = getLoggedInUser();
      
      if (loggedInUser) {
        // Always fetch the latest profile info on component mount if not fully loaded
        if (!loggedInUser.avatarUrl) {
          const token = localStorage.getItem('accessToken');
          if (token) {
            try {
              const profile = await fetchUserProfile(loggedInUser.id, token);
              // The profile object from your API contains bio, avatarUrl, address
              const fullUser = { ...loggedInUser, ...profile };
              localStorage.setItem('user', JSON.stringify(fullUser));
              setUser(fullUser);
            } catch (error) {
              console.error('Failed to fetch user profile:', error);
              setUser(loggedInUser); // Fallback to user data without full profile
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

    // Listen for storage changes to update UI if login/logout happens in another tab
    const handleStorageChange = () => {
      updateUser();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
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
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const avatarSrc = user.avatarUrl && backendUrl ? `${backendUrl}${user.avatarUrl}` : `https://avatar.vercel.sh/${user.username}.png`;

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
