
'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getLoggedInUser, updateUserProfile } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload } from 'lucide-react';

type User = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
};

const profileFormSchema = z.object({
  firstname: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastname: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  bio: z.string().max(160, { message: 'Bio must not be longer than 160 characters.' }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const userData = getLoggedInUser();
    setUser(userData);
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
      bio: user?.bio || '',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: ProfileFormValues) {
    const token = localStorage.getItem('accessToken');
    if (!user || !token) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to update your profile.',
      });
      return;
    }

    try {
      // NOTE: This is a simulated API call.
      // You will need to implement the actual backend logic for updating the user profile.
      await updateUserProfile(user.id, token, data);
      
      // Update user data in local storage
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update your profile.',
      });
    }
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <PageHeader title="My Profile" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
             <Card>
                <CardContent className="pt-6 flex flex-col items-center gap-4">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <div className="space-y-1 text-center">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-24" />
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const avatarSrc = user.avatarUrl && backendUrl ? `${backendUrl}${user.avatarUrl}` : `https://avatar.vercel.sh/${user.username}.png`;


  return (
    <div className="space-y-4">
      <PageHeader title="My Profile" />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
            <Card>
                <CardContent className="pt-6 flex flex-col items-center gap-4">
                    <div className="relative">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={avatarSrc} alt={user.username} />
                            <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Button size="icon" className="absolute bottom-0 right-0 rounded-full">
                            <Upload className="h-4 w-4" />
                            <span className="sr-only">Upload new photo</span>
                        </Button>
                    </div>
                    <div className="text-center">
                        <CardTitle className="text-2xl">{user.firstname} {user.lastname}</CardTitle>
                        <p className="text-muted-foreground">@{user.username}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>
                    Update your personal information here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us a little bit about yourself"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={!form.formState.isDirty}>Save Changes</Button>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
