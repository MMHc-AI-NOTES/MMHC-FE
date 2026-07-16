import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { User, CreateUserRequest } from '@/types/settings';
import UserTableSkeleton from './components/UserTableSkeleton';
const UserTable = lazy(() => import('./components/UserTable'));
const UserDialog = lazy(() => import('./components/UserDialog'));
import { DataTablePagination } from '@/shared/DataTablePagination';
import { UserRoleEnum, UserRoleLabels } from '@/constants/common';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { resendOnboardingInvite } from '@/pages/settings/settingsApiCalls';
import {
  createUserThunk,
  fetchUsersListingThunk,
  selectUsersListingEntry,
  selectUsersListingLoading,
  touchListingAfterMutation,
  updateUserThunk,
  type UsersQuery,
} from '@/store/slices/usersSlice';
import { Separator } from '@/components/ui/separator';
import { usePaginationPersistence } from '@/hooks/usePaginationPersistence';

const defaultFilters = {
  search: '',
  role: 'all' as 'all' | number,
};

const UserManagementTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const loggedInUserId = useAppSelector(state => state.auth.user?.id ?? null);

  // Filters (Apply/Clear flow similar to NotesQueue)
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  // Pagination with persistence
  const [pagination, setPagination] = usePaginationPersistence('userManagementPagination', { currentPage: 1, itemsPerPage: 20 });
  const currentPage = pagination.currentPage;
  const itemsPerPage = Math.min(pagination.itemsPerPage, 20);

  const query: UsersQuery = useMemo(
    () => ({
      page: currentPage,
      pageSize: itemsPerPage,
      search: appliedFilters.search,
      role: appliedFilters.role === 'all' ? 'all' : (appliedFilters.role as any),
    }),
    [appliedFilters.role, appliedFilters.search, currentPage, itemsPerPage],
  );

  const listingEntry = useAppSelector(state => selectUsersListingEntry(state, query));
  const listingLoading = useAppSelector(state => selectUsersListingLoading(state, query));
  const userEntities = useAppSelector(state => state.users.entities);

  const users = useMemo(() => {
    if (!listingEntry) return [];
    return listingEntry.ids.map(id => userEntities[id]).filter(Boolean);
  }, [listingEntry, userEntities]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isTableReady, setIsTableReady] = useState(false);

  useEffect(() => {
    const schedule = () => setIsTableReady(true);

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(schedule);
      return () => window.cancelIdleCallback(id);
    }

    const id = setTimeout(schedule, 0);
    return () => clearTimeout(id);
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = useCallback((user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  }, []);

  const handleSaveUser = async (userForm: CreateUserRequest) => {
    if (editingUser) {
      const payload = {
        full_name: userForm.fullName,
        email: userForm.email,
        type: userForm.type,
        is_active: userForm.isActive,
      };
      const updated = await dispatch(updateUserThunk({ id: editingUser.id, payload })).unwrap();
      dispatch(touchListingAfterMutation({ userId: updated.id }));
    } else {
      const payload = {
        full_name: userForm.fullName,
        email: userForm.email,
        type: userForm.type,
        is_active: userForm.isActive,
      };
      const created = await dispatch(createUserThunk(payload)).unwrap();
      dispatch(touchListingAfterMutation({ userId: created.id }));
    }

    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleApplyFilters = async () => {
    const nextQuery: UsersQuery = {
      page: 1,
      pageSize: itemsPerPage,
      search: filters.search,
      role: filters.role === 'all' ? 'all' : (filters.role as any),
    };
    dispatch(fetchUsersListingThunk(nextQuery));
    setAppliedFilters(filters);
    setPagination({ ...pagination, currentPage: 1, itemsPerPage });
  };

  const handleClearFilters = async () => {
    const nextQuery: UsersQuery = {
      page: 1,
      pageSize: itemsPerPage,
      search: defaultFilters.search,
      role: 'all',
    };
    dispatch(fetchUsersListingThunk(nextQuery));
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPagination({ ...pagination, currentPage: 1, itemsPerPage });
  };

  const handlePageChange = (page: number) => {
    const nextQuery: UsersQuery = { ...query, page };
    dispatch(fetchUsersListingThunk(nextQuery));
    setPagination({ ...pagination, currentPage: page, itemsPerPage });
  };

  const handleItemsPerPageChange = (value: number) => {
    const nextQuery: UsersQuery = { ...query, page: 1, pageSize: value };
    dispatch(fetchUsersListingThunk(nextQuery));
    setPagination({ ...pagination, currentPage: 1, itemsPerPage: value });
  };

  const handleRequestUpdate = useCallback(
    async (user: User, updates: Partial<Pick<User, 'type' | 'isActive'>>) => {
      const payload = {
        full_name: user.fullName,
        email: user.email,
        type: (updates.type ?? user.type) as any,
        is_active: (updates.isActive ?? user.isActive) as any,
      };
      const updated = await dispatch(updateUserThunk({ id: user.id, payload })).unwrap();
      dispatch(touchListingAfterMutation({ userId: updated.id }));
    },
    [dispatch],
  );

  const handleResendInvite = useCallback(async (userId: string) => {
    await resendOnboardingInvite(Number(userId));
  }, []);

  // Defer data fetch until shell is painted to reduce main-thread contention
  useEffect(() => {
    if (!isTableReady) return;
    dispatch(fetchUsersListingThunk(query));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTableReady]);

  return (
    <div>
      <Card className="p-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-primary text-lg font-semibold">User Management</h3>
            <Button onClick={handleAddUser} className="bg-gradient-light text-primary w-28 border-0 font-semibold shadow-sm">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
          <Separator className="my-4" />
          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <Input
                value={filters.search}
                placeholder="Search by name or email"
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div className="md:col-span-3">
              <Select
                value={filters.role.toString()}
                onValueChange={value => setFilters(prev => ({ ...prev, role: value === 'all' ? 'all' : Number(value) }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value={UserRoleEnum.superAdmin.toString()}>{UserRoleLabels[UserRoleEnum.superAdmin]}</SelectItem>
                  <SelectItem value={UserRoleEnum.user.toString()}>{UserRoleLabels[UserRoleEnum.user]}</SelectItem>
                  <SelectItem value={UserRoleEnum.practitioner.toString()}>{UserRoleLabels[UserRoleEnum.practitioner]}</SelectItem>
                  <SelectItem value={UserRoleEnum.sme_reviewer.toString()}>{UserRoleLabels[UserRoleEnum.sme_reviewer]}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 md:col-span-5">
              <Button className="bg-white text-black" variant="outline" onClick={handleClearFilters} disabled={listingLoading} size="lg">
                Clear
              </Button>
              <Button onClick={handleApplyFilters} disabled={listingLoading} size="lg">
                Apply
              </Button>
            </div>
          </div>

          {isTableReady ? (
            <Suspense fallback={<UserTableSkeleton />}>
              <UserTable
                users={users}
                loading={listingLoading || !listingEntry}
                loggedInUserId={loggedInUserId}
                onRequestUpdate={handleRequestUpdate}
                onEditUser={handleEditUser}
                onResendInvite={handleResendInvite}
              />
            </Suspense>
          ) : (
            <UserTableSkeleton />
          )}

          {listingEntry?.meta && (
            <div className="mt-6">
              <DataTablePagination
                currentPage={listingEntry.meta.page || currentPage}
                totalPages={listingEntry.meta.total_page_count || 1}
                itemsPerPage={itemsPerPage}
                totalItems={listingEntry.meta.total_count || 0}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPageOptions={[20]}
                showFirstLastButtons={true}
                itemName="user"
                itemNamePlural="users"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {isDialogOpen && (
        <Suspense fallback={null}>
          <UserDialog isOpen={isDialogOpen} onClose={handleCloseDialog} editingUser={editingUser} onSave={handleSaveUser} />
        </Suspense>
      )}
    </div>
  );
};

export default UserManagementTab;
