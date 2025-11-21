'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { MapPin } from 'lucide-react';

const formSchema = z.object({
  address: z.string().min(10, {
    message: 'Please enter a valid address.',
  }),
});

export default function VerifyPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: 'Verification Submitted',
      description: "We've received your address and will process it shortly.",
    });
    form.reset();
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Verify Your Address" />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Neighborhood Verification</CardTitle>
          <CardDescription>
            Please enter your full residential address to confirm you are part
            of the neighborhood.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="123 Main St, Anytown, USA" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your address will only be used for verification and will
                      not be shared publicly.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Verify Address
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
