import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, UserRole } from '@/types/settings';
import UserTableRow from './UserTableRow';

interface UserTableProps {
  users: User[];
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onToggleStatus: (userId: string) => void;
  onEditUser: (user: User) => void;
  onResetPassword: (userId: string) => void;
  onResendInvite: (userId: string) => void;
  onDeactivate: (userId: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onRoleChange,
  onToggleStatus,
  onEditUser,
  onResetPassword,
  onResendInvite,
  onDeactivate,
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
          {users.map(user => (
            <UserTableRow
              key={user.id}
              user={user}
              onRoleChange={onRoleChange}
              onToggleStatus={onToggleStatus}
              onEditUser={onEditUser}
              onResetPassword={onResetPassword}
              onResendInvite={onResendInvite}
              onDeactivate={onDeactivate}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
