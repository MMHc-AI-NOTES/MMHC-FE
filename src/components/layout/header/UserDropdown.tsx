import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';
import { logoutUser } from '@/pages/auth/authApiCalls';
import { handleLogout } from '@/utils/helper';
import ConfirmationDialog from '@/shared/ConfirmationDialog';
import { useAppSelector } from '@/store/store';

const UserDropdown = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = useAppSelector(state => state.auth.user);

  const userProfilePicture = (user as any)?.profilePicture;
  const avatarFallback = (user?.fullName?.match(/\b\w/g)?.slice(0, 2).join('') ?? user?.email?.slice(0, 2) ?? 'U').toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="hover:bg-accent inline-flex items-center gap-2 rounded-md px-2 py-1.5">
            <Avatar className="h-8 w-8">
              {userProfilePicture && <AvatarImage src={userProfilePicture} alt={user?.fullName || 'User'} />}
              <AvatarFallback className="bg-primary-light text-primary">{avatarFallback}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        isLoading={isLoading}
        onOpenChange={setIsDialogOpen}
        onConfirm={async () => {
          setIsLoading(true);
          const result = await logoutUser();
          setIsLoading(false);
          if (result) {
            setIsDialogOpen(false);
            handleLogout();
          }
        }}
        title="Log Out"
        description="Are you sure you want to log out? You will need to log in again to access your account."
        confirmButtonText="Log Out"
      />
    </>
  );
};

export default UserDropdown;
