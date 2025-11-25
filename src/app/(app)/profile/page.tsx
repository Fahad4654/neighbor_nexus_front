
'use client';

import { useEffect, useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';

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
import { getLoggedInUser, updateUserProfile, uploadAvatar } from '@/lib/auth';
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

type User = {
  id: string;
  firstname: string;
  lastname: string;
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
  bio: z.string().max(160, { message: 'Bio must not be longer than 160 characters.' }).optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const InfoField = ({ icon, label, value, isEditing }: { icon: React.ElementType, label: string, value: React.ReactNode, isEditing: boolean }) => {
    const Icon = icon;
    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={String(value ?? 'N/A')} readOnly className={cn("pl-10 bg-muted/50", isEditing && "bg-red-50 dark:bg-red-950/30")} />
            </div>
        </FormItem>
    );
};


export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(getLoggedInUser);
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateUserState = () => {
      const loggedInUser = getLoggedInUser();
      setUser(loggedInUser);
      if (loggedInUser) {
        const storedAvatar = localStorage.getItem('avatarImage');
        if (storedAvatar) {
          setAvatarSrc(storedAvatar);
        } else {
          setAvatarSrc(`https://avatar.vercel.sh/${loggedInUser.username}.png`);
        }
      } else {
        setAvatarSrc(undefined);
      }
    };

    updateUserState();

    window.addEventListener('storage', updateUserState);
    return () => {
      window.removeEventListener('storage', updateUserState);
    };
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
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

    try {
      const result = await updateUserProfile(user.id, token, data);
      
      const updatedUserFromStorage = getLoggedInUser();
      setUser(updatedUserFromStorage);
      setIsEditing(false);

      window.dispatchEvent(new Event('storage'));

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

  const handleCancel = () => {
    if (user) {
        form.reset({
            firstname: user.firstname,
            lastname: user.lastname,
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
        // The 'storage' event listener will handle updating the avatarSrc
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: error.message || 'Could not upload your avatar.',
        });
      }
    }
  };


  if (!user) {
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
                              <Input placeholder="John" {...field} readOnly={!isEditing} className={!isEditing ? 'bg-muted/50' : ''}/>
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
                              <Input placeholder="Doe" {...field} readOnly={!isEditing} className={!isEditing ? 'bg-muted/50' : ''}/>
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
                              className={cn("resize-none", !isEditing ? 'bg-muted/50' : '')}
                              {...field}
                              readOnly={!isEditing}
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
                                <Input placeholder="123 Main St, Anytown, USA" {...field} readOnly={!isEditing} className={cn("pl-10", !isEditing ? 'bg-muted/50' : '')} />
                               </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InfoField icon={UserIcon} label="Username" value={user.username} isEditing={isEditing} />
                        <InfoField icon={Mail} label="Email" value={user.email} isEditing={isEditing} />
                        <InfoField icon={Phone} label="Phone Number" value={user.phoneNumber} isEditing={isEditing} />
                         <FormItem>
                            <FormLabel>Geo Location</FormLabel>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input value={geoDisplayValue} readOnly className={cn("pl-10 bg-muted/50", isEditing && "bg-red-50 dark:bg-red-950/30")} />
                            </div>
                        </FormItem>
                        <InfoField icon={KeyRound} label="Created By" value={user.createdBy} isEditing={isEditing} />
                        <InfoField icon={KeyRound} label="Updated By" value={user.updatedBy} isEditing={isEditing} />
                        <FormItem>
                            <FormLabel>Created At</FormLabel>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input value={user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'} readOnly className={cn("pl-10 bg-muted/50", isEditing && "bg-red-50 dark:bg-red-950/30")} />
                            </div>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Updated At</FormLabel>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input value={user.updatedAt ? format(new Date(user.updatedAt), 'PPP') : 'NA'} readOnly className={cn("pl-10 bg-muted/50", isEditing && "bg-red-50 dark:bg-red-950/30")} />
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
