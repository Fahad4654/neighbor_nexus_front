
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
import { Users } from 'lucide-react';

type User = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  createdAt?: string;
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
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.firstname} {user.lastname}</TableCell>
                    <TableCell>
                       <Badge variant={user.isVerified ? 'secondary' : 'outline'}>
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isAdmin ? <Badge variant="destructive">Admin</Badge> : 'User'}
                    </TableCell>
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
