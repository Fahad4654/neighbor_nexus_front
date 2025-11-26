
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
  profile?: {
    avatarUrl?: string;
  };
};

export function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const updateUserState = () => {
      const loggedInUser = getLoggedInUser();
      setUser(loggedInUser);
      if (loggedInUser) {
        const storedAvatar = localStorage.getItem('avatarImage');
        if (storedAvatar) {
          setAvatarSrc(storedAvatar);
        } else if (loggedInUser.profile?.avatarUrl) {
          // Fallback if avatar is not in local storage for some reason
           setAvatarSrc(`${process.env.NEXT_PUBLIC_BACKEND_URL}${loggedInUser.profile.avatarUrl}`);
        } else {
          setAvatarSrc(`https://avatar.vercel.sh/${loggedInUser.username}.png`);
        }
      } else {
        setAvatarSrc(undefined);
      }
    };

    updateUserState();

    // Listen for changes in localStorage (e.g., after login/logout/profile update)
    window.addEventListener('storage', updateUserState);
    return () => {
      window.removeEventListener('storage', updateUserState);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAvatarSrc(undefined);
    // This event is now more critical to ensure all tabs update
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
              key={avatarSrc} // Add key to force re-render on change
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
