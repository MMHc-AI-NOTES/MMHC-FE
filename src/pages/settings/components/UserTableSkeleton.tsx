import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface UserTableSkeletonProps {
  rows?: number;
}

const UserTableSkeleton: React.FC<UserTableSkeletonProps> = ({ rows = 5 }) => {
  return (
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
          {Array.from({ length: rows }).map((_, idx) => (
            <TableRow key={idx}>
              <TableCell className="text-left">
                <Skeleton className="h-5 w-40" />
              </TableCell>
              <TableCell className="text-left">
                <Skeleton className="h-5 w-56" />
              </TableCell>
              <TableCell className="text-left">
                <Skeleton className="h-9 w-32 rounded-full" />
              </TableCell>
              <TableCell className="text-left">
                <Skeleton className="h-6 w-10 rounded-full" />
              </TableCell>
              <TableCell className="flex justify-center">
                <Skeleton className="h-8 w-8 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTableSkeleton;
