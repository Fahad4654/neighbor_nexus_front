'use client';

import { usePathname } from 'next/navigation';
import {
  Home,
  Wrench,
  Lightbulb,
  ArrowRightLeft,
  ShieldCheck,
} from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/skills', label: 'Skills', icon: Lightbulb },
  { href: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { href: '/verify', label: 'Verify', icon: ShieldCheck },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} legacyBehavior passHref>
            <SidebarMenuButton
              isActive={pathname === item.href}
              className={cn(pathname === item.href && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary")}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
