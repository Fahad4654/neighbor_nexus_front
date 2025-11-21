'use client';

import { usePathname } from 'next/navigation';
import {
  Home,
  Wrench,
  Lightbulb,
  ArrowRightLeft,
  ShieldCheck,
  LogIn,
  UserPlus,
  LogOut,
} from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getLoggedInUser, logout } from '@/lib/auth';

export function Nav() {
  const pathname = usePathname();
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getLoggedInUser());
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.push('/login');
    router.refresh();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, show: 'loggedIn' },
    { href: '/tools', label: 'Tools', icon: Wrench, show: 'loggedIn' },
    { href: '/skills', label: 'Skills', icon: Lightbulb, show: 'loggedIn' },
    { href: '/transactions', label: 'Transactions', icon: ArrowRightLeft, show: 'loggedIn' },
    { href: '/verify', label: 'Verify', icon: ShieldCheck, show: 'loggedIn' },
    { href: '/login', label: 'Login', icon: LogIn, show: 'loggedOut' },
    { href: '/signup', label: 'Sign Up', icon: UserPlus, show: 'loggedOut' },
  ];

  return (
    <SidebarMenu>
      {navItems
        .filter(item => (user ? item.show === 'loggedIn' : item.show === 'loggedOut'))
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
       {user && (
        <SidebarMenuItem>
          <SidebarMenuButton onClick={handleLogout}>
            <LogOut />
            <span>Logout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}
