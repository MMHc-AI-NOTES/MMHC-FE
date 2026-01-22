import React, { useMemo, useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, UserRole } from '@/types/settings';
import { UserRoleEnum, UserRoleLabels } from '@/constants/common';
import UserActionsDropdown from './UserActionsDropdown';
import ConfirmationDialog from '@/shared/ConfirmationDialog';
import { useAppSelector } from '@/store/store';
import { selectUsersUpdateLoading } from '@/store/slices/usersSlice';

interface UserTableRowProps {
  user: User;
  loggedInUserId: number | null;
  onRequestUpdate: (user: User, updates: Partial<Pick<User, 'type' | 'isActive'>>) => Promise<void>;
  onEditUser: (user: User) => void;
  onResendInvite: (userId: string) => Promise<void>;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ user, loggedInUserId, onRequestUpdate, onEditUser, onResendInvite }) => {
  const isSelf = useMemo(() => (loggedInUserId != null ? user.id === loggedInUserId : false), [loggedInUserId, user.id]);
  const isUpdating = useAppSelector(state => selectUsersUpdateLoading(state, user.id));

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<Pick<User, 'type' | 'isActive'>>>({});
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDescription, setConfirmDescription] = useState('');

  const requestRoleChange = (value: string) => {
    const nextRole = Number(value) as UserRole;
    setPendingUpdates({ type: nextRole });
    setConfirmTitle('Update User Role');
    setConfirmDescription(`Are you sure you want to change ${user.fullName}'s role to "${UserRoleLabels[nextRole]}"?`);
    setConfirmOpen(true);
  };

  const requestStatusChange = (checked: boolean) => {
    setPendingUpdates({ isActive: checked });
    setConfirmTitle('Update User Status');
    setConfirmDescription(`Are you sure you want to ${checked ? 'activate' : 'deactivate'} ${user.fullName}?`);
    setConfirmOpen(true);
  };

  return (
    <>
      <TableRow>
        <TableCell className="text-left">{user.fullName}</TableCell>
        <TableCell className="text-left">{user.email}</TableCell>
        <TableCell className="text-left">
          <Select value={user.type.toString()} onValueChange={requestRoleChange}>
            <SelectTrigger size="sm" className="min-w-36 rounded-full" disabled={isSelf || isUpdating}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserRoleEnum.superAdmin.toString()}>{UserRoleLabels[UserRoleEnum.superAdmin]}</SelectItem>
              <SelectItem value={UserRoleEnum.user.toString()}>{UserRoleLabels[UserRoleEnum.user]}</SelectItem>
              <SelectItem value={UserRoleEnum.practitioner.toString()}>{UserRoleLabels[UserRoleEnum.practitioner]}</SelectItem>
              <SelectItem value={UserRoleEnum.sme_reviewer.toString()}>{UserRoleLabels[UserRoleEnum.sme_reviewer]}</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="text-left">
          <Switch checked={user.isActive} disabled={isSelf || isUpdating} onCheckedChange={requestStatusChange} />
        </TableCell>
        <TableCell>
          <UserActionsDropdown user={user} onEditUser={onEditUser} onResendInvite={onResendInvite} disabled={isSelf || isUpdating} />
        </TableCell>
      </TableRow>

      <ConfirmationDialog
        isOpen={confirmOpen}
        isLoading={isUpdating}
        onOpenChange={open => {
          setConfirmOpen(open);
          if (!open) setPendingUpdates({});
        }}
        onConfirm={async () => {
          await onRequestUpdate(user, pendingUpdates);
          setConfirmOpen(false);
          setPendingUpdates({});
        }}
        title={confirmTitle}
        description={confirmDescription}
        confirmButtonText="Update"
      />
    </>
  );
};

export default UserTableRow;
