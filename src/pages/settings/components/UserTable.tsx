import React, { useCallback, useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, UserRole } from '@/types/settings';
import { UserRoleLabels } from '@/constants/common';
import UserTableRowInteractive from './UserTableRow';
import UserTableRowStatic from './UserTableRowStatic';
import UserTableSkeleton from './UserTableSkeleton';
import ConfirmationDialog from '@/shared/ConfirmationDialog';
import { useAppSelector } from '@/store/store';
import { selectUsersUpdateLoading } from '@/store/slices/usersSlice';

const HYDRATE_BATCH = 3;
const HYDRATE_DELAY_MS = 64;

interface UserTableProps {
  users: User[];
  loading?: boolean;
  loggedInUserId: number | null;
  onRequestUpdate: (user: User, updates: Partial<Pick<User, 'type' | 'isActive'>>) => Promise<void>;
  onEditUser: (user: User) => void;
  onResendInvite: (userId: string) => Promise<void>;
}

type ConfirmState = {
  user: User;
  updates: Partial<Pick<User, 'type' | 'isActive'>>;
  title: string;
  description: string;
};

const UserTable: React.FC<UserTableProps> = ({ users, loading, loggedInUserId, onRequestUpdate, onEditUser, onResendInvite }) => {
  const [hydratedCount, setHydratedCount] = useState(0);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const confirmingUserId = confirmState?.user.id ?? null;
  const isConfirming = useAppSelector(state => (confirmingUserId != null ? selectUsersUpdateLoading(state, confirmingUserId) : false));

  useEffect(() => {
    setHydratedCount(0);
  }, [users]);

  useEffect(() => {
    if (loading || hydratedCount >= users.length) return;

    const delay = hydratedCount === 0 ? 0 : HYDRATE_DELAY_MS;
    const id = setTimeout(() => {
      setHydratedCount(prev => Math.min(prev + HYDRATE_BATCH, users.length));
    }, delay);

    return () => clearTimeout(id);
  }, [loading, users.length, hydratedCount]);

  const handleRequestRoleChange = useCallback((user: User, role: UserRole) => {
    setConfirmState({
      user,
      updates: { type: role },
      title: 'Update User Role',
      description: `Are you sure you want to change ${user.fullName}'s role to "${UserRoleLabels[role]}"?`,
    });
  }, []);

  const handleRequestStatusChange = useCallback((user: User, isActive: boolean) => {
    setConfirmState({
      user,
      updates: { isActive },
      title: 'Update User Status',
      description: `Are you sure you want to ${isActive ? 'activate' : 'deactivate'} ${user.fullName}?`,
    });
  }, []);

  if (loading) {
    return <UserTableSkeleton rows={5} />;
  }

  return (
    <>
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
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) =>
                index < hydratedCount ? (
                  <UserTableRowInteractive
                    key={user.id}
                    user={user}
                    loggedInUserId={loggedInUserId}
                    onRequestRoleChange={handleRequestRoleChange}
                    onRequestStatusChange={handleRequestStatusChange}
                    onEditUser={onEditUser}
                    onResendInvite={onResendInvite}
                  />
                ) : (
                  <UserTableRowStatic key={user.id} user={user} />
                ),
              )
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmationDialog
        isOpen={confirmState != null}
        isLoading={isConfirming}
        onOpenChange={open => {
          if (!open) setConfirmState(null);
        }}
        onConfirm={async () => {
          if (!confirmState) return;
          await onRequestUpdate(confirmState.user, confirmState.updates);
          setConfirmState(null);
        }}
        title={confirmState?.title ?? ''}
        description={confirmState?.description ?? ''}
        confirmButtonText="Update"
      />
    </>
  );
};

export default UserTable;
