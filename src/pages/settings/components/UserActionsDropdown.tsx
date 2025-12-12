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
  onDeactivate: (userId: string) => void;
}

const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({ user, onEditUser, onResetPassword, onResendInvite, onDeactivate }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 space-y-3">
        <DropdownMenuItem onClick={() => onEditUser(user)}>Edit User</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onResetPassword(user.id)}>Reset Password</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onResendInvite(user.id)}>Resend Invite</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDeactivate(user.id)}>Deactivate</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActionsDropdown;
