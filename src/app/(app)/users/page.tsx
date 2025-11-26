
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

  useEffect(() => {
    const checkAdminAndFetchUsers = async () => {
      const loggedInUser = getLoggedInUser();
      const token = localStorage.getItem('accessToken');

      if (!loggedInUser || !loggedInUser.isAdmin) {
        router.push('/dashboard'); // Redirect if not an admin
        return;
      }
      
      if (token) {
        try {
          const allUsers = await fetchAllUsers(token);
          setUsers(allUsers);
        } catch (error) {
          console.error("Failed to fetch users", error);
        }
      }
      setLoading(false);
    };

    checkAdminAndFetchUsers();
  }, [router]);

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Geo Location</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.firstname}</TableCell>
                    <TableCell>{user.lastname}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
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
                    <TableCell>{formatGeoLocation(user.geo_location)}</TableCell>
                    <TableCell>
                      {user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
