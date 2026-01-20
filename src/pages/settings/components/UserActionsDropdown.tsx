import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { User } from '@/types/settings';

interface UserActionsDropdownProps {
  user: User;
  onEditUser: (user: User) => void;
  onResetPassword: (userId: string) => void;
  onResendInvite: (userId: string) => void;
  disabled?: boolean;
}

const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({ user, onEditUser, onResetPassword, onResendInvite, disabled }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={disabled}>
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
        <DropdownMenuItem disabled={disabled} onClick={() => onResendInvite(String(user.id))}>
          Resend Invite
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActionsDropdown;
