'use client';

import { usePathname } from 'next/navigation';
import {
  Home,
  Wrench,
  Lightbulb,
  ArrowRightLeft,
  ShieldCheck,
  LogIn,
  LogOut,
  UserPlus
} from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


export function Nav() {
  const pathname = usePathname();
  const user = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: error.message,
      });
    }
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home, show: 'always' },
    { href: '/tools', label: 'Tools', icon: Wrench, show: 'always' },
    { href: '/skills', label: 'Skills', icon: Lightbulb, show: 'always' },
    { href: '/transactions', label: 'Transactions', icon: ArrowRightLeft, show: 'loggedIn' },
    { href: '/verify', label: 'Verify', icon: ShieldCheck, show: 'loggedIn' },
    { href: '/login', label: 'Login', icon: LogIn, show: 'loggedOut' },
    { href: '/signup', label: 'Sign Up', icon: UserPlus, show: 'loggedOut' },
  ];

  return (
    <SidebarMenu>
      {navItems
        .filter(item => {
          if (item.show === 'loggedIn') return !!user;
          if (item.show === 'loggedOut') return !user;
          return true;
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
