

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/PageHeader';
import { getLoggedInUser, fetchAllUsers } from '@/lib/auth';
import Loading from '@/app/loading';
import { Users, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  phoneNumber?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  rating_avg?: string;
  geo_location?: {
    type: 'Point';
    coordinates: [number, number];
  };
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAndFetchUsers = async () => {
      const loggedInUser = getLoggedInUser();

      if (!loggedInUser || !loggedInUser.isAdmin) {
        router.push('/dashboard'); // Redirect if not an admin
        return;
      }
      
      try {
        const allUsers = await fetchAllUsers();
        setUsers(allUsers);
      } catch (error: any) {
        console.error("Failed to fetch users", error);
        toast({
            variant: 'destructive',
            title: 'Error fetching users',
            description: error.message || 'Could not load user data.',
        });
      }
      
      setLoading(false);
    };

    checkAdminAndFetchUsers();
  }, [router, toast]);

  if (loading) {
    return <Loading />;
  }
  
  const formatGeoLocation = (geo?: { type: 'Point'; coordinates: [number, number]; }) => {
    if (!geo || !geo.coordinates) return 'N/A';
    return `${geo.coordinates[1].toFixed(4)}, ${geo.coordinates[0].toFixed(4)}`;
  }

  return (
    <div className="space-y-4">
      <PageHeader title="User Management" />
       <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              All Users
            </CardTitle>
            <CardDescription>
                A list of all users in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[1200px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Username</TableHead>
                    <TableHead className="w-[150px]">First Name</TableHead>
                    <TableHead className="w-[150px]">Last Name</TableHead>
                    <TableHead className="w-[200px]">Email</TableHead>
                    <TableHead className="w-[150px]">Phone</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[100px]">Role</TableHead>
                    <TableHead className="w-[100px]">Rating</TableHead>
                    <TableHead className="w-[150px]">Geo Location</TableHead>
                    <TableHead className="w-[150px]">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium truncate">{user.username}</TableCell>
                      <TableCell className="truncate">{user.firstname}</TableCell>
                      <TableCell className="truncate">{user.lastname}</TableCell>
                      <TableCell className="truncate">{user.email}</TableCell>
                      <TableCell className="truncate">{user.phoneNumber || 'N/A'}</TableCell>
                      <TableCell>
                         <Badge variant={user.isVerified ? 'secondary' : 'outline'}>
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isAdmin ? <Badge variant="destructive">Admin</Badge> : 'User'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 
                            {user.rating_avg ? parseFloat(user.rating_avg).toFixed(1) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="truncate">{formatGeoLocation(user.geo_location)}</TableCell>
                      <TableCell className="truncate">
                        {user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}