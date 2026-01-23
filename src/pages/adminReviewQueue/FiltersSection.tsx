import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { PriorityEnum, PriorityLabels, AiStatusEnum, AiStatusLabels, UserRoleEnum } from '@/constants/common';
import { getEnumValues } from '@/utils/helper';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { useEffect, useMemo } from 'react';
import { fetchUsersListingThunk, type UsersQuery } from '@/store/slices/usersSlice';

interface FiltersSectionProps {
  filters: {
    status: string;
    priority: string;
    reviewer: string;
    search: string;
  };
  loading: boolean;
  onFilterChange: (key: string, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export const FiltersSection = ({ filters, loading, onFilterChange, onApplyFilters, onClearFilters }: FiltersSectionProps) => {
  const dispatch = useAppDispatch();
  const userEntities = useAppSelector(state => state.users.entities);

  // Get all users from entities
  const users = useMemo(() => {
    return Object.values(userEntities).filter(Boolean);
  }, [userEntities]);

  // Filter users to only include practitioner and sme_reviewer (exclude superAdmin and user)
  const reviewers = useMemo(() => {
    return users.filter(user => user.type === UserRoleEnum.practitioner || user.type === UserRoleEnum.sme_reviewer);
  }, [users]);

  // Fetch users listing when users array is empty (e.g., on mount or after reload)
  useEffect(() => {
    if (users.length === 0) {
      const query: UsersQuery = {
        page: 1,
        pageSize: 100,
        search: '',
        role: 'all',
      };
      dispatch(fetchUsersListingThunk(query));
    }
  }, [users.length, dispatch]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Status */}
        <div className="w-full md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-500">Status</label>
          <Select value={filters.status} onValueChange={value => onFilterChange('status', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {getEnumValues(AiStatusEnum).map(value => (
                <SelectItem key={value} value={value.toString()}>
                  {AiStatusLabels[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="w-full md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-500">Priority</label>
          <Select value={filters.priority} onValueChange={value => onFilterChange('priority', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {getEnumValues(PriorityEnum).map(value => (
                <SelectItem key={value} value={value.toString()}>
                  {PriorityLabels[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reviewer */}
        <div className="w-full md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-500">Reviewer</label>
          <Select value={filters.reviewer} onValueChange={value => onFilterChange('reviewer', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {reviewers.map(r => (
                <SelectItem key={r.id} value={r.id.toString()}>
                  {r.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="w-full md:col-span-6">
          <label className="mb-2 block text-sm font-medium text-gray-500">Search</label>
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search note ID or practitioner..."
              value={filters.search}
              onChange={e => onFilterChange('search', e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>
      </div>

      {/* Apply and Clear Buttons */}
      <div className="flex justify-end gap-3">
        <Button className="bg-white text-black" variant="outline" onClick={onClearFilters} disabled={loading} size="lg">
          Clear
        </Button>
        <Button onClick={onApplyFilters} disabled={loading} size="lg">
          Apply
        </Button>
      </div>
    </div>
  );
};
