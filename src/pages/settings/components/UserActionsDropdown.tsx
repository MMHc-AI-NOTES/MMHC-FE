import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, MoreVertical } from 'lucide-react';
import { User } from '@/types/settings';

interface UserActionsDropdownProps {
  user: User;
  onEditUser: (user: User) => void;
  onResetPassword: (userId: string) => void;
  onResendInvite: (userId: string) => Promise<void>;
  disabled?: boolean;
}

const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({ user, onEditUser, onResetPassword, onResendInvite, disabled }) => {
  const [resendLoading, setResendLoading] = useState(false);

  return (
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
        <DropdownMenuItem disabled={disabled} onClick={() => onResetPassword(String(user.id))}>
          Reset Password
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={disabled || resendLoading}
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
  );
};

export default UserActionsDropdown;
