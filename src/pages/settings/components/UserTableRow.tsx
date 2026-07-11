import React, { lazy, Suspense, useMemo, useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { User, UserRole } from '@/types/settings';
import { UserRoleEnum, UserRoleLabels } from '@/constants/common';
import { useAppSelector } from '@/store/store';
import { selectUsersUpdateLoading } from '@/store/slices/usersSlice';

const UserActionsDropdown = lazy(() => import('./UserActionsDropdown'));

interface UserTableRowInteractiveProps {
  user: User;
  loggedInUserId: number | null;
  onRequestRoleChange: (user: User, role: UserRole) => void;
  onRequestStatusChange: (user: User, isActive: boolean) => void;
  onEditUser: (user: User) => void;
  onResendInvite: (userId: string) => Promise<void>;
}

const UserTableRowInteractive: React.FC<UserTableRowInteractiveProps> = React.memo(
  ({ user, loggedInUserId, onRequestRoleChange, onRequestStatusChange, onEditUser, onResendInvite }) => {
    const isSelf = useMemo(() => (loggedInUserId != null ? user.id === loggedInUserId : false), [loggedInUserId, user.id]);
    const isUpdating = useAppSelector(state => selectUsersUpdateLoading(state, user.id));
    const [actionsMounted, setActionsMounted] = useState(false);

    return (
      <TableRow>
        <TableCell className="text-left">{user.fullName}</TableCell>
        <TableCell className="text-left">{user.email}</TableCell>
        <TableCell className="text-left">
          <Select value={user.type.toString()} onValueChange={value => onRequestRoleChange(user, Number(value) as UserRole)}>
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
          <Switch
            checked={user.isActive}
            disabled={isSelf || isUpdating}
            onCheckedChange={checked => onRequestStatusChange(user, checked)}
          />
        </TableCell>
        <TableCell>
          {actionsMounted ? (
            <Suspense
              fallback={
                <Button variant="ghost" size="sm" disabled>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
            >
              <UserActionsDropdown user={user} onEditUser={onEditUser} onResendInvite={onResendInvite} disabled={isSelf || isUpdating} />
            </Suspense>
          ) : (
            <Button variant="ghost" size="sm" disabled={isSelf || isUpdating} onClick={() => setActionsMounted(true)}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
        </TableCell>
      </TableRow>
    );
  },
);

UserTableRowInteractive.displayName = 'UserTableRowInteractive';

export default UserTableRowInteractive;
