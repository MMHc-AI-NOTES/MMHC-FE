import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { User, CreateUserRequest, UpdateUserRequest, UserRole } from '@/types/settings';
import UserTable from './components/UserTable';
import UserDialog from './components/UserDialog';

interface UserManagementTabProps {
  // For future API integration
  onSaveUser?: (user: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  // onDeleteUser?: (userId: string) => Promise<void>;
  onResetPassword?: (userId: string) => Promise<void>;
  onResendInvite?: (userId: string) => Promise<void>;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({ onSaveUser, onResetPassword, onResendInvite }) => {
  // Dummy data - will be replaced with API calls
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      fullName: 'Dr. Sarah Chen',
      email: 'sarah.chen@mmh.com',
      role: 1,
      status: 'active',
    },
    {
      id: '2',
      fullName: 'Mark Rodriguez',
      email: 'mark.r@mmh.com',
      role: 2,
      status: 'inactive',
    },
    {
      id: '3',
      fullName: 'Emily Thompson',
      email: 'emily.t@mmh.com',
      role: 2,
      status: 'inactive',
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleSaveUser = async (userForm: CreateUserRequest) => {
    if (editingUser) {
      const updatedUser: User = {
        ...editingUser,
        ...userForm,
      };
      setUsers(prev => prev.map(u => (u.id === editingUser.id ? updatedUser : u)));
      if (onSaveUser) {
        await onSaveUser({ ...userForm, id: editingUser.id });
      }
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...userForm,
      };
      setUsers(prev => [...prev, newUser]);
      if (onSaveUser) {
        await onSaveUser(userForm);
      }
    }
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleToggleStatus = async (userId: string) => {
    setUsers(prev => prev.map(user => (user.id === userId ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user)));
    // In future, call API here
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(user => (user.id === userId ? { ...user, role: newRole } : user)));
    // In future, call API here
  };

  const handleResetPassword = async (userId: string) => {
    if (onResetPassword) {
      await onResetPassword(userId);
    } else {
      console.log('Reset password for user:', userId);
    }
  };

  const handleResendInvite = async (userId: string) => {
    if (onResendInvite) {
      await onResendInvite(userId);
    } else {
      console.log('Resend invite for user:', userId);
    }
  };

  const handleDeactivate = async (userId: string) => {
    setUsers(prev => prev.map(user => (user.id === userId ? { ...user, status: 'inactive' } : user)));
    // In future, call API here
  };

  return (
    <div>
      <Card className="p-2">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-primary text-lg font-semibold">User Management</h3>
            <Button onClick={handleAddUser} className="bg-gradient-light text-primary w-28 rounded-full border-0 font-semibold shadow-sm">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
          <UserTable
            users={users}
            onRoleChange={handleRoleChange}
            onToggleStatus={handleToggleStatus}
            onEditUser={handleEditUser}
            onResetPassword={handleResetPassword}
            onResendInvite={handleResendInvite}
            onDeactivate={handleDeactivate}
          />
        </CardContent>
      </Card>

      <UserDialog isOpen={isDialogOpen} onClose={handleCloseDialog} editingUser={editingUser} onSave={handleSaveUser} />
    </div>
  );
};

export default UserManagementTab;
