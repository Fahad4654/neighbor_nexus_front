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
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const updateUser = async () => {
      let loggedInUser = getLoggedInUser();
      
      if (loggedInUser) {
        // If user is in local storage but doesn't have avatarUrl, fetch full profile
        if (!loggedInUser.avatarUrl) {
          const token = localStorage.getItem('accessToken');
          if (token) {
            try {
              const profile = await fetchUserProfile(loggedInUser.id, token);
              // Merge profile data into the user object
              const fullUser = { ...loggedInUser, ...profile };
              // Update local storage so we don't have to fetch next time
              localStorage.setItem('user', JSON.stringify(fullUser));
              loggedInUser = fullUser;
            } catch (error) {
              console.error('Failed to fetch user profile for avatar:', error);
              // If fetching fails, we proceed with the user data we have.
            }
          }
        }
        setUser(loggedInUser);
      }
    };

    updateUser();
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
            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
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
