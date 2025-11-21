'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import type { Transaction } from '@/lib/data';
import { StarRating } from './StarRating';
import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';

export function ReviewDialog({ transaction }: { transaction: Transaction }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    console.log({
      transactionId: transaction.id,
      rating,
      comment,
    });
    toast({
      title: 'Review Submitted!',
      description: 'Thank you for your feedback.',
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          Leave a Review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review your experience</DialogTitle>
          <DialogDescription>
            Your feedback helps build a better community. Please rate your
            experience with the {transaction.type.toLowerCase()} of "{transaction.item}".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-center">
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
          <Textarea
            placeholder="Share your thoughts..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={rating === 0}
            >
              Submit Review
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
