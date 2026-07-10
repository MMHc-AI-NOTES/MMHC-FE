import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { User } from '@/types/settings';
import { UserRoleLabels } from '@/constants/common';

interface UserTableRowStaticProps {
  user: User;
}

const UserTableRowStatic: React.FC<UserTableRowStaticProps> = React.memo(({ user }) => (
  <TableRow>
    <TableCell className="text-left">{user.fullName}</TableCell>
    <TableCell className="text-left">{user.email}</TableCell>
    <TableCell className="text-left">
      <span className="inline-flex min-w-36 items-center rounded-full border px-3 py-1.5 text-sm">{UserRoleLabels[user.type]}</span>
    </TableCell>
    <TableCell className="text-left">
      <span className={`inline-block h-6 w-10 rounded-full ${user.isActive ? 'bg-primary' : 'bg-muted'}`} aria-hidden />
    </TableCell>
    <TableCell>
      <Button variant="ghost" size="sm" disabled>
        <MoreVertical className="h-4 w-4" />
      </Button>
    </TableCell>
  </TableRow>
));

UserTableRowStatic.displayName = 'UserTableRowStatic';

export default UserTableRowStatic;
