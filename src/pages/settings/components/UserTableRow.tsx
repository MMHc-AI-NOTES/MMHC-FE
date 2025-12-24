import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, UserRole } from '@/types/settings';
import { UserRoleEnum, UserRoleLabels } from '@/constants/common';
import UserActionsDropdown from './UserActionsDropdown';

interface UserTableRowProps {
  user: User;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onToggleStatus: (userId: string) => void;
  onEditUser: (user: User) => void;
  onResetPassword: (userId: string) => void;
  onResendInvite: (userId: string) => void;
  onDeactivate: (userId: string) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  onRoleChange,
  onToggleStatus,
  onEditUser,
  onResetPassword,
  onResendInvite,
  onDeactivate,
}) => {
  return (
    <TableRow>
      <TableCell className="text-left">{user.fullName}</TableCell>
      <TableCell className="text-left">{user.email}</TableCell>
      <TableCell className="text-left">
        <Select value={user.role.toString()} onValueChange={(value: string) => onRoleChange(user.id, Number(value) as UserRole)}>
          <SelectTrigger size="sm" className="rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UserRoleEnum.super_admin.toString()}>{UserRoleLabels[UserRoleEnum.super_admin]}</SelectItem>
            <SelectItem value={UserRoleEnum.practitioner.toString()}>{UserRoleLabels[UserRoleEnum.practitioner]}</SelectItem>
            {/* <SelectItem value={UserRoleEnum.manager}>{UserRoleLabels[UserRoleEnum.manager]}</SelectItem> */}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-left">
        <Switch checked={user.status === 'active'} onCheckedChange={() => onToggleStatus(user.id)} />
      </TableCell>
      <TableCell>
        <UserActionsDropdown
          user={user}
          onEditUser={onEditUser}
          onResetPassword={onResetPassword}
          onResendInvite={onResendInvite}
          onDeactivate={onDeactivate}
        />
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
