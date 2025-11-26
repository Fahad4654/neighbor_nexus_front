
'use client';

import { useEffect, useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

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
import { getLoggedInUser, updateUser, uploadAvatar, fetchUserProfile } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, 
  Upload, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Star,
  Calendar,
  KeyRound,
  BadgeCheck,
  Edit,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/StarRating';
import { cn } from '@/lib/utils';
import _ from 'lodash';

type User = {
  id: string;
  firstname: string;
  lastname:string;
  email: string;
  username: string;
  phoneNumber?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  rating_avg?: number | string;
  geo_location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  profile?: {
    bio?: string;
    avatarUrl?: string;
    address?: string;
  }
};

const profileFormSchema = z.object({
  firstname: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastname: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  phoneNumber: z.string().optional(),
  bio: z.string().max(160, { message: 'Bio must not be longer than 160 characters.' }).optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      const loggedInUser = getLoggedInUser();
      const token = localStorage.getItem('accessToken');

      // Attempt to load avatar from localStorage immediately for faster UI
      const storedAvatar = localStorage.getItem('avatarImage');
      if (storedAvatar) {
        setAvatarSrc(storedAvatar);
      } else if (loggedInUser) {
        setAvatarSrc(`https://avatar.vercel.sh/${loggedInUser.username}.png`);
      }

      if (loggedInUser && token) {
        try {
          const freshUserData = await fetchUserProfile(loggedInUser.id, token);
          setUser(freshUserData);
          localStorage.setItem('user', JSON.stringify(freshUserData)); // Sync localStorage
        } catch (error) {
          console.error("Failed to fetch profile", error);
          // Fallback to localStorage if API fails
          const storedUser = getLoggedInUser();
          if (storedUser) setUser(storedUser);
        }
      }
      setLoading(false);
    };

    loadUserData();
    
    // This listener handles avatar updates from other tabs or after uploads
    const handleStorageChange = () => {
        const storedAvatar = localStorage.getItem('avatarImage');
        if (user && storedAvatar) {
            setAvatarSrc(storedAvatar);
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
      phoneNumber: user?.phoneNumber || '',
      bio: user?.profile?.bio || '',
      address: user?.profile?.address || '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (user) {
        form.reset({
            firstname: user.firstname || '',
            lastname: user.lastname || '',
            phoneNumber: user.phoneNumber || '',
            bio: user.profile?.bio || '',
            address: user.profile?.address || '',
        });
    }
  }, [user, form]);

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

    const { formState: { dirtyFields } } = form;
    
    const coreFieldsToUpdate = _.pick(data, _.intersection(Object.keys(dirtyFields), ['firstname', 'lastname', 'phoneNumber']));
    const profileFieldsToUpdate = _.pick(data, _.intersection(Object.keys(dirtyFields), ['bio', 'address']));

    let successCount = 0;
    const totalOperations = (Object.keys(coreFieldsToUpdate).length > 0 ? 1 : 0) + (Object.keys(profileFieldsToUpdate).length > 0 ? 1 : 0);

    try {
        if (Object.keys(coreFieldsToUpdate).length > 0) {
            await updateUser(user.id, token, 'core', coreFieldsToUpdate);
            successCount++;
        }
        if (Object.keys(profileFieldsToUpdate).length > 0) {
            await updateUser(user.id, token, 'profile', profileFieldsToUpdate);
            successCount++;
        }
        
        if (successCount > 0) {
          toast({
            title: 'Profile Updated',
            description: 'Your profile has been updated successfully.',
          });
        } else {
           toast({
            title: 'No Changes',
            description: 'You have not made any changes to save.',
          });
        }
        
    } catch (error: any) {
         toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: error.message || 'Could not update your profile.',
        });
    }

    if (successCount > 0) {
      // Re-fetch data from server to ensure UI is in sync with the latest data
      const freshUserData = await fetchUserProfile(user.id, token);
      setUser(freshUserData);
      localStorage.setItem('user', JSON.stringify(freshUserData));
      window.dispatchEvent(new Event('storage'));
      setIsEditing(false);
      router.refresh();
    }
  }

  const handleCancel = () => {
    if (user) {
        form.reset({
            firstname: user.firstname || '',
            lastname: user.lastname || '',
            phoneNumber: user.phoneNumber || '',
            bio: user.profile?.bio || '',
            address: user.profile?.address || '',
        });
    }
    setIsEditing(false);
  };
  
  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const token = localStorage.getItem('accessToken');

    if (file && user && token) {
      try {
        await uploadAvatar(user.id, token, file);
        toast({
          title: 'Avatar Uploaded',
          description: 'Your new profile picture has been saved.',
        });
        router.refresh();
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: error.message || 'Could not upload your avatar.',
        });
      }
    }
  };


  if (loading || !user) {
    return (
      <div className="space-y-4">
        <PageHeader title="My Profile" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
             <Card>
                <CardContent className="pt-6 flex flex-col items-center gap-4">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <div className="space-y-2 text-center">
                        <Skeleton className="h-6 w-32" />
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

  const ratingValue = typeof user.rating_avg === 'string' ? parseFloat(user.rating_avg) : user.rating_avg || 0;
  
  const geoDisplayValue =
    user.geo_location &&
    user.geo_location.coordinates &&
    Array.isArray(user.geo_location.coordinates) &&
    user.geo_location.coordinates.length === 2
      ? `${user.geo_location.coordinates[1].toFixed(4)}, ${user.geo_location.coordinates[0].toFixed(4)}`
      : 'Not set';


  return (
    <div className="space-y-4">
      <PageHeader title="My Profile" />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
            <Card>
                <CardContent className="pt-6 flex flex-col items-center gap-4">
                    <div className="relative">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept="image/png, image/jpeg, image/gif"
                        />
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={avatarSrc} alt={user.username} />
                            <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Button size="icon" className="absolute bottom-0 right-0 rounded-full" onClick={handleAvatarUploadClick}>
                            <Upload className="h-4 w-4" />
                            <span className="sr-only">Upload new photo</span>
                        </Button>
                    </div>
                    <div className="text-center space-y-1">
                        <CardTitle className="text-2xl">{user.firstname} {user.lastname}</CardTitle>
                    </div>
                     {user.rating_avg != null && (
                        <div className="flex items-center gap-2">
                            <StarRating rating={ratingValue} readOnly />
                            <span className="text-muted-foreground text-sm">({ratingValue.toFixed(1)})</span>
                        </div>
                    )}
                    <div className="flex gap-2">
                        {user.isVerified && <Badge variant="secondary"><BadgeCheck className="w-4 h-4 mr-1"/> Verified</Badge>}
                        {user.isAdmin && <Badge variant="destructive">Admin</Badge>}
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            View and manage your personal details.
                        </CardDescription>
                    </div>
                     {!isEditing && (
                        <Button type="button" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
                    )}
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
                                <Input {...field} disabled={!isEditing} className={cn(!isEditing ? 'bg-green-50 dark:bg-green-950/30' : '')} />
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
                                <Input {...field} disabled={!isEditing} className={cn(!isEditing ? 'bg-green-50 dark:bg-green-950/30' : '')} />
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
                              className={cn("resize-none", !isEditing ? 'bg-green-50 dark:bg-green-950/30' : '')}
                              {...field}
                              disabled={!isEditing}
                              />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                               <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="123 Main St, Anytown, USA" {...field} disabled={!isEditing} className={cn("pl-10", !isEditing ? 'bg-green-50 dark:bg-green-950/30' : '')} />
                               </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                       <FormItem>
                          <FormLabel>Username</FormLabel>
                          <div className="relative">
                              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input value={user.username} disabled className="pl-10 bg-green-50 dark:bg-green-950/30" />
                          </div>
                      </FormItem>
                       <FormItem>
                          <FormLabel>Email</FormLabel>
                          <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input value={user.email} disabled className="pl-10 bg-green-50 dark:bg-green-950/30" />
                          </div>
                      </FormItem>
                      <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input {...field} disabled={!isEditing} className={cn("pl-10", !isEditing ? 'bg-green-50 dark:bg-green-950/30' : '')} />
                                </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormItem>
                            <FormLabel>Geo Location</FormLabel>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input value={geoDisplayValue} disabled className="pl-10 bg-green-50 dark:bg-green-950/30" />
                            </div>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Created By</FormLabel>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input value={user.createdBy || 'N/A'} disabled className="pl-10 bg-green-50 dark:bg-green-950/30" />
                            </div>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Updated By</FormLabel>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input value={user.updatedBy || 'N/A'} disabled className="pl-10 bg-green-50 dark:bg-green-950/30" />
                            </div>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Created At</FormLabel>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input value={user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'} disabled className="pl-10 bg-green-50 dark:bg-green-950/30" />
                            </div>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Updated At</FormLabel>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input value={user.updatedAt ? format(new Date(user.updatedAt), 'PPP') : 'NA'} disabled className="pl-10 bg-green-50 dark:bg-green-950/30" />
                            </div>
                        </FormItem>
                    </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Button type="submit" disabled={!form.formState.isDirty}>Save Changes</Button>
                      <Button variant="outline" type="button" onClick={handleCancel}>Cancel</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

    