
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRightLeft, Lightbulb, UserCheck, Wrench, Users } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Transaction, transactions } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { getLoggedInUser } from '@/lib/auth';
import { format } from 'date-fns';

type User = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  createdAt?: string;
};

const UserAvatar = ({ avatarId }: { avatarId: string }) => {
  const avatar = placeholderImages.find((img) => img.id === avatarId);
  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={avatar?.imageUrl} alt={avatar?.description} data-ai-hint={avatar?.imageHint} />
      <AvatarFallback>U</AvatarFallback>
    </Avatar>
  );
};

export default function Dashboard() {
  
  const stats = [
    {
      title: 'Tools Shared',
      value: '12',
      icon: Wrench,
    },
    {
      title: 'Skills Exchanged',
      value: '8',
      icon: Lightbulb,
    },
    {
      title: 'Active Transactions',
      value: '4',
      icon: ArrowRightLeft,
    },
    {
      title: 'Verified Neighbors',
      value: '27',
      icon: UserCheck,
    },
  ];

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((tx: Transaction) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.item}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserAvatar avatarId={tx.user.avatarId} />
                      {tx.user.name}
                    </div>
                  </TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        tx.status === 'Completed' &&
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                        tx.status === 'Pending' &&
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                        tx.status === 'Active' &&
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      )}
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{tx.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
