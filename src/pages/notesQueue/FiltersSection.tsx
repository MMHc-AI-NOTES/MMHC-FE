import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';
import { useAppSelector } from '@/store/store';
import {
  // AiStatusEnum,
  // WorkflowEnum,
  // PriorityEnum,
  SessionTypeEnum,
  // AiStatusLabels,
  // WorkflowLabels,
  // PriorityLabels,
  SessionTypeLabels,
  UserRoleEnum,
} from '@/constants/common';
import { PractitionerOption, CptCodeOption } from '@/types/notes';
import { getEnumValues } from '@/utils/helper';

interface FiltersSectionProps {
  filters: {
    status: string;
    noteType: string;
    practitioner: string;
    reviewStage: string;
    priority: string;
    dateRange: string;
    cptCode: string;
    aiStatus: string;
    humanReview: string;
    manager: string;
    workflow: string;
    search: string;
    notReviewedByMe: boolean;
    notReviewedByAnyone: boolean;
  };
  practitioners: PractitionerOption[];
  cptCodes: CptCodeOption[];
  loading: boolean;
  onFilterChange: (key: string, value: string | boolean) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export const FiltersSection = ({
  filters,
  practitioners,
  cptCodes,
  loading,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}: FiltersSectionProps) => {
  const user = useAppSelector(state => state.auth.user);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Row 1: Status, Note Type, Practitioner */}
        {/* <div className="w-full">
          <label className="mb-2 block text-sm font-medium text-gray-500">Status</label>
          <Select value={filters.aiStatus} onValueChange={value => onFilterChange('aiStatus', value)}>
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
        </div> */}

        <div className="w-full">
          <label className="mb-2 block text-sm font-medium text-gray-500">Note Type</label>
          <Select value={filters.noteType} onValueChange={value => onFilterChange('noteType', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {getEnumValues(SessionTypeEnum).map(value => (
                <SelectItem key={value} value={value.toString()}>
                  {SessionTypeLabels[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
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
        <div className="w-full">
          <label className="mb-2 block text-sm font-medium text-gray-500">Date Range</label>
          <Select value={filters.dateRange} onValueChange={value => onFilterChange('dateRange', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Review Stage, Priority, Date Range */}
      {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="w-full">
          <label className="mb-2 block text-sm font-medium text-gray-500">Workflow</label>
          <Select value={filters.workflow} onValueChange={value => onFilterChange('workflow', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {getEnumValues(WorkflowEnum).map(value => (
                <SelectItem key={value} value={value.toString()}>
                  {WorkflowLabels[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
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

        <div className="w-full">
          <label className="mb-2 block text-sm font-medium text-gray-500">Date Range</label>
          <Select value={filters.dateRange} onValueChange={value => onFilterChange('dateRange', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div> */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Row 3: CPT Code, Search */}
        <div className="w-full">
          <label className="mb-2 block text-sm font-medium text-gray-500">CPT Code</label>
          <Select value={filters.cptCode} onValueChange={value => onFilterChange('cptCode', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {cptCodes.map(code => (
                <SelectItem key={code.id} value={code.id.toString()}>
                  {code.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <label className="mb-2 block text-sm font-medium text-gray-500">Search</label>
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Note ID, practitioner, or client..."
              value={filters.search}
              onChange={e => onFilterChange('search', e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>
      </div>

      {/* Checkbox Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <div
            className={`flex items-center gap-3 rounded-md border-2 px-4 py-2.5 hover:border-[#B0E490] hover:bg-green-50 ${filters.notReviewedByAnyone ? 'border-[#B0E490] bg-green-50' : 'border-gray-200 bg-white'}`}
          >
            <Checkbox
              id="not-reviewed-by-anyone"
              className="border-gray-300 data-[state=checked]:border-transparent data-[state=checked]:bg-[#B0E490] [&_svg]:!size-4"
              checked={filters.notReviewedByAnyone}
              onCheckedChange={checked => onFilterChange('notReviewedByAnyone', checked === true)}
            />
            <label
              htmlFor="not-reviewed-by-anyone"
              className={`cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                filters.notReviewedByAnyone ? 'text-primary' : 'text-gray-500'
              }`}
            >
              Notes not reviewed by anyone
            </label>
          </div>
        </div>
        {user?.type === UserRoleEnum.sme_reviewer && (
          <div className="flex items-center space-x-2">
            <div
              className={`flex items-center gap-3 rounded-md border-2 px-4 py-2.5 hover:border-[#B0E490] hover:bg-green-50 ${filters.notReviewedByMe ? 'border-[#B0E490] bg-green-50' : 'border-gray-200 bg-white'}`}
            >
              <Checkbox
                id="reviewed-by-me"
                className="border-gray-300 data-[state=checked]:border-transparent data-[state=checked]:bg-[#B0E490] [&_svg]:!size-4"
                checked={filters.notReviewedByMe}
                onCheckedChange={checked => onFilterChange('notReviewedByMe', checked === true)}
              />
              <label
                htmlFor="reviewed-by-me"
                className={`cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                  filters.notReviewedByMe ? 'text-primary' : 'text-gray-500'
                }`}
              >
                Show only notes not reviewed by me
              </label>
            </div>
            {user?.fullName && <span className="text-muted-foreground text-xs">(Logged in as: {user.fullName})</span>}
          </div>
        )}
      </div>

      {/* Apply and Clear Buttons */}
      <div className="flex justify-end gap-3">
        <Button className="bg-white text-black" variant="outline" onClick={onClearFilters} disabled={loading} size="lg">
          {/* <RefreshCw className="h-4 w-4" /> */}
          Clear
        </Button>
        <Button onClick={onApplyFilters} disabled={loading} size="lg">
          Apply
        </Button>
      </div>
    </div>
  );
};
