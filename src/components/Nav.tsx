'use client';

import { usePathname } from 'next/navigation';
import {
  Home,
  Wrench,
  Lightbulb,
  ArrowRightLeft,
  LogIn,
  UserPlus,
  Users,
} from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { getLoggedInUser } from '@/lib/auth';

type User = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  isAdmin?: boolean;
};

export function Nav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // This function will be called on mount and on storage events
    const updateUserState = () => {
      setUser(getLoggedInUser());
    };
    
    updateUserState(); // Initial check
    window.addEventListener('storage', updateUserState); // Listen for changes
    
    return () => {
      window.removeEventListener('storage', updateUserState); // Cleanup
    };
  }, []);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, show: 'loggedIn' },
    { href: '/tools', label: 'Tools', icon: Wrench, show: 'loggedIn' },
    { href: '/skills', label: 'Skills', icon: Lightbulb, show: 'loggedIn' },
    { href: '/transactions', label: 'Transactions', icon: ArrowRightLeft, show: 'loggedIn' },
    { href: '/users', label: 'Users', icon: Users, show: 'adminOnly' },
    { href: '/login', label: 'Login', icon: LogIn, show: 'loggedOut' },
    { href: '/signup', label: 'Sign Up', icon: UserPlus, show: 'loggedOut' },
  ];

  return (
    <SidebarMenu>
      {navItems
        .filter(item => {
          if (user) {
            if (item.show === 'adminOnly') {
              return user.isAdmin;
            }
            return item.show === 'loggedIn' || item.show === 'adminOnly';
          }
          return item.show === 'loggedOut';
        })
        .map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            className={cn(
              pathname === item.href &&
                'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
            )}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
