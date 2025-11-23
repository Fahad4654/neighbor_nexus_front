
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Phone, MapPin, KeyRound } from 'lucide-react';
import { register, verifyOtp } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';

const registrationFormSchema = z
  .object({
    username: z.string().min(2, { message: 'Username must be at least 2 characters.' }),
    firstname: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
    lastname: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    phoneNumber: z.string().min(10, { message: 'Please enter a valid phone number.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string(),
    location: z.object({
        lat: z.number(),
        lng: z.number(),
    }).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const otpFormSchema = z.object({
  otp: z.string().min(6, { message: 'OTP must be 6 characters.' }),
});

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [step, setStep] = useState<'registration' | 'otp'>('registration');
  const [identifier, setIdentifier] = useState('');

  const GoogleMapPicker = useMemo(() => dynamic(() => import('@/components/GoogleMapPicker'), {
    ssr: false,
    loading: () => <Skeleton className="h-[200px] w-full" />,
  }), []);


  const registrationForm = useForm<z.infer<typeof registrationFormSchema>>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      username: '',
      firstname: '',
      lastname: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const otpForm = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: '',
    },
  });

  async function onRegistrationSubmit(values: z.infer<typeof registrationFormSchema>) {
    if (!location) {
        toast({
            variant: "destructive",
            title: "Location Required",
            description: "Please select your location on the map.",
        });
        return;
    }

    const registrationData = {
      username: values.username,
      firstname: values.firstname,
      lastname: values.lastname,
      email: values.email,
      password: values.password,
      phoneNumber: values.phoneNumber,
      location: location,
    };

    try {
      await register(registrationData);
      setIdentifier(values.email); // Or username/phoneNumber
      setStep('otp');
      toast({
        title: 'Registration Submitted',
        description: "We've sent an OTP to your email. Please verify to continue.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  }

  async function onOtpSubmit(values: z.infer<typeof otpFormSchema>) {
    try {
      await verifyOtp(identifier, values.otp);
      toast({
        title: 'Account Verified!',
        description: "Your account has been created successfully. Please log in.",
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "OTP Verification Failed",
        description: error.message || "Invalid or expired OTP.",
      });
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
      <Card className="w-full max-w-lg">
        {step === 'registration' ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Sign Up</CardTitle>
              <CardDescription>
                Create an account to start sharing with your neighbors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...registrationForm}>
                <form onSubmit={registrationForm.handleSubmit(onRegistrationSubmit)} className="space-y-4">
                  <div className="space-y-4">
                    {/* Username */}
                    <FormField
                      control={registrationForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="johndoe" {...field} className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone */}
                    <FormField
                      control={registrationForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="123-456-7890" {...field} className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* First & Last Name */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={registrationForm.control}
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
                        control={registrationForm.control}
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

                    {/* Email */}
                    <FormField
                      control={registrationForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="name@example.com" {...field} className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Password */}
                    <FormField
                      control={registrationForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Confirm Password */}
                    <FormField
                      control={registrationForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Location Picker */}
                    <FormField
                      control={registrationForm.control}
                      name="location"
                      render={() => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Select Your Location
                          </FormLabel>
                          <FormDescription>
                            Drag the marker to your approximate location.
                          </FormDescription>
                          <FormControl>
                            <div className="h-[200px] w-full rounded-md border">
                              <GoogleMapPicker onLocationChange={setLocation} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-4">
                    Create Account
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="text-sm">
              <p className="w-full text-center text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Login
                </Link>
              </p>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Verify Your Email</CardTitle>
              <CardDescription>
                An OTP has been sent to {identifier}. Please enter it below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>One-Time Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="123456" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    Verify Account
                  </Button>
                </form>
              </Form>
            </CardContent>
             <CardFooter className="text-sm">
              <p className="w-full text-center text-muted-foreground">
                Didn't receive an OTP?{' '}
                <Button variant="link" className="px-1 h-auto" onClick={() => onRegistrationSubmit(registrationForm.getValues())}>
                  Resend
                </Button>
              </p>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
