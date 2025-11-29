'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { transactions, Transaction } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ReviewDialog } from '@/components/ReviewDialog';
import { placeholderImages } from '@/lib/placeholder-images.json';

const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
  const avatar = placeholderImages.find(img => img.id === transaction.user.avatarId);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{transaction.item}</CardTitle>
          <Badge
            variant="outline"
            className={cn(
              'capitalize',
              transaction.status === 'Completed' &&
                'border-green-500 text-green-500',
              transaction.status === 'Pending' &&
                'border-yellow-500 text-yellow-500',
              transaction.status === 'Active' && 'border-blue-500 text-blue-500'
            )}
          >
            {transaction.status}
          </Badge>
        </div>
        <CardDescription>
          {transaction.type} with {transaction.user.name} on {transaction.date}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={avatar?.imageUrl} alt={avatar?.description} data-ai-hint={avatar?.imageHint} />
            <AvatarFallback>{transaction.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="text-sm text-muted-foreground">
            {transaction.user.name}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {transaction.status === 'Pending' && (
          <>
            <Button variant="outline">Decline</Button>
            <Button className="bg-primary hover:bg-primary/90">Approve</Button>
          </>
        )}
        {transaction.status === 'Active' && (
          <Button>Mark as Complete</Button>
        )}
        {transaction.status === 'Completed' && (
          <ReviewDialog transaction={transaction} />
        )}
      </CardFooter>
    </Card>
  );
};

export default function TransactionsPage() {
  const [filter, setFilter] = useState('Active');
  const filters = ['Active', 'Pending', 'Completed'];

  const filteredTransactions = transactions.filter((t) => t.status === filter);

  return (
    <div className="space-y-4">
      <PageHeader title="My Transactions" />
      <div className="flex items-center gap-2">
        {filters.map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <TransactionCard key={tx.id} transaction={tx} />
          ))
        ) : (
          <p className="text-muted-foreground col-span-2 mt-4">
            No {filter.toLowerCase()} transactions.
          </p>
        )}
      </div>
    </div>
  );
}
