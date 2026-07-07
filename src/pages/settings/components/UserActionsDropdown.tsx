import React, { lazy, Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, MoreVertical } from 'lucide-react';
import { User } from '@/types/settings';

const ResetPasswordDialog = lazy(() => import('./ResetPasswordDialog'));

interface UserActionsDropdownProps {
  user: User;
  onEditUser: (user: User) => void;
  onResendInvite: (userId: string) => Promise<void>;
  disabled?: boolean;
}

const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({ user, onEditUser, onResendInvite, disabled }) => {
  const [resendLoading, setResendLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={disabled || resendLoading}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 space-y-3">
          <DropdownMenuItem disabled={disabled} onClick={() => onEditUser(user)}>
            Edit User
          </DropdownMenuItem>
          <DropdownMenuItem disabled={disabled} onClick={() => setResetOpen(true)}>
            Reset Password
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={disabled || resendLoading || user.hasCompletedOnboarding}
            onClick={async () => {
              try {
                setResendLoading(true);
                await onResendInvite(String(user.id));
              } finally {
                setResendLoading(false);
              }
            }}
          >
            {resendLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {resendLoading ? 'Resending…' : 'Resend Invite'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {resetOpen && (
        <Suspense fallback={null}>
          <ResetPasswordDialog userId={user.id} open={resetOpen} onOpenChange={setResetOpen} />
        </Suspense>
      )}
    </>
  );
};

export default UserActionsDropdown;
