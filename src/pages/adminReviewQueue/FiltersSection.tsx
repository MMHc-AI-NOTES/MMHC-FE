import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="w-full md:max-w-md">
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
    </div>
  );
};
