'use client';

import { usePathname } from 'next/navigation';
import {
  Home,
  Wrench,
  Lightbulb,
  ArrowRightLeft,
  ShieldCheck,
  LogIn,
  UserPlus
} from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


export function Nav() {
  const pathname = usePathname();
  const { toast } = useToast();
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home, show: 'always' },
    { href: '/tools', label: 'Tools', icon: Wrench, show: 'always' },
    { href: '/skills', label: 'Skills', icon: Lightbulb, show: 'always' },
    { href: '/transactions', label: 'Transactions', icon: ArrowRightLeft, show: 'always' },
    { href: '/verify', label: 'Verify', icon: ShieldCheck, show: 'always' },
    { href: '/login', label: 'Login', icon: LogIn, show: 'always' },
    { href: '/signup', label: 'Sign Up', icon: UserPlus, show: 'always' },
  ];

  return (
    <SidebarMenu>
      {navItems.map((item) => (
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
