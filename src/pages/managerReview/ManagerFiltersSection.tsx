import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import {
  PriorityEnum,
  PriorityLabels,
  UserRoleEnum,
  // DisagreementLevelEnum,
  // DisagreementLevelLabels
} from '@/constants/common';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { useEffect, useMemo } from 'react';
import { fetchUsersListingThunk, type UsersQuery } from '@/store/slices/usersSlice';
// import { getHumanReviewDecisionOptions } from '@/utils/helper';

interface FiltersSectionProps {
  filters: {
    humanDecision: string | 'all';
    priority: string | 'all';
    disagreement: string | 'all';
    practitioner: string | 'all';
    reviewer: string | 'all';
    search: string;
  };
  loading: boolean;
  onFilterChange: (key: string, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

// const managerDecisions = getHumanReviewDecisionOptions();
// const disagreementLevels = Object.values(DisagreementLevelEnum) as number[];
const priorityLevels = Object.values(PriorityEnum) as number[];

export const ManagerFiltersSection = ({ filters, loading, onFilterChange, onApplyFilters, onClearFilters }: FiltersSectionProps) => {
  const dispatch = useAppDispatch();
  const userEntities = useAppSelector(state => state.users.entities);

  // Get all users from entities
  const users = useMemo(() => {
    return Object.values(userEntities).filter(Boolean);
  }, [userEntities]);

  // Filter users to only include practitioners
  const practitioners = useMemo(() => {
    return users.filter(user => user.type === UserRoleEnum.practitioner);
  }, [users]);

  // Filter users to only include reviewers (sme_reviewer)
  const reviewers = useMemo(() => {
    return users.filter(user => user.type === UserRoleEnum.sme_reviewer);
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
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
        {/* <div className="w-full md:col-span-3">
          <label className="mb-2 block text-sm font-medium text-gray-500">Human Decision</label>
          <Select
            value={filters.humanDecision === 'all' ? 'all' : filters.humanDecision.toString()}
            onValueChange={value => onFilterChange('humanDecision', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {managerDecisions.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}

        <div className="w-full md:col-span-3">
          <label className="mb-2 block text-sm font-medium text-gray-500">Priority</label>
          <Select
            value={filters.priority === 'all' ? 'all' : filters.priority.toString()}
            onValueChange={value => onFilterChange('priority', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {priorityLevels.map(option => (
                <SelectItem key={option} value={option.toString()}>
                  {PriorityLabels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:col-span-3">
          <label className="mb-2 block text-sm font-medium text-gray-500">Practitioner</label>
          <Select value={filters.practitioner} onValueChange={value => onFilterChange('practitioner', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {practitioners.map(p => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:col-span-3">
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

        {/* <div className="w-full md:col-span-3">
          <label className="mb-2 block text-sm font-medium text-gray-500">AI/Human Disagreement</label>
          <Select
            value={filters.disagreement === 'all' ? 'all' : filters.disagreement.toString()}
            onValueChange={value => onFilterChange('disagreement', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {disagreementLevels.map(option => (
                <SelectItem key={option} value={option.toString()}>
                  {DisagreementLevelLabels[option.toString()]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}

        <div className="w-full md:col-span-3">
          <label className="mb-2 block text-sm font-medium text-gray-500">Search</label>
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search note ID"
              value={filters.search}
              onChange={e => onFilterChange('search', e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>
      </div>
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
