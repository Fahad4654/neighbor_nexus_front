'use client';

import PageHeader from '@/components/PageHeader';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  const getTransactionsByStatus = (status: string) => {
    return transactions.filter((t) => t.status === status);
  };

  const tabs = ['Active', 'Pending', 'Completed'];

  return (
    <div className="space-y-4">
      <PageHeader title="My Transactions" />
      <Tabs defaultValue="Active">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="grid gap-4 md:grid-cols-2">
              {getTransactionsByStatus(tab).length > 0 ? (
                getTransactionsByStatus(tab).map((tx) => (
                  <TransactionCard key={tx.id} transaction={tx} />
                ))
              ) : (
                <p className="text-muted-foreground col-span-2 mt-4">
                  No {tab.toLowerCase()} transactions.
                </p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
