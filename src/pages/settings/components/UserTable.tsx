import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from '@/types/settings';
import UserTableRow from './UserTableRow';

interface UserTableProps {
  users: User[];
  loading?: boolean;
  loggedInUserId: number | null;
  onRequestUpdate: (user: User, updates: Partial<Pick<User, 'type' | 'isActive'>>) => Promise<void>;
  onEditUser: (user: User) => void;
  onResetPassword: (userId: string) => void;
  onResendInvite: (userId: string) => Promise<void>;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  loggedInUserId,
  onRequestUpdate,
  onEditUser,
  onResetPassword,
  onResendInvite,
}) => {
  return (
    <div className="overflow-x-auto rounded-lg border-2 border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-primary text-left">NAME</TableHead>
            <TableHead className="text-primary text-left">EMAIL</TableHead>
            <TableHead className="text-primary text-left">ROLE</TableHead>
            <TableHead className="text-primary text-left">STATUS</TableHead>
            <TableHead className="text-primary">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell className="text-left">
                  <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell className="text-left">
                  <Skeleton className="h-5 w-56" />
                </TableCell>
                <TableCell className="text-left">
                  <Skeleton className="h-9 w-32 rounded-full" />
                </TableCell>
                <TableCell className="text-left">
                  <Skeleton className="h-6 w-10 rounded-full" />
                </TableCell>
                <TableCell className="flex justify-center">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map(user => (
              <UserTableRow
                key={user.id}
                user={user}
                loggedInUserId={loggedInUserId}
                onRequestUpdate={onRequestUpdate}
                onEditUser={onEditUser}
                onResetPassword={onResetPassword}
                onResendInvite={onResendInvite}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
