import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import {
  PriorityEnum,
  DisagreementLevelEnum,
  PriorityLabels,
  DisagreementLevelLabels,
  getHumanReviewDecisionOptions,
} from '@/constants/common';

interface FiltersSectionProps {
  filters: {
    humanDecision: string | 'all';
    priority: string | 'all';
    disagreement: string | 'all';
    search: string;
  };
  loading: boolean;
  onFilterChange: (key: string, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const managerDecisions = getHumanReviewDecisionOptions();
const disagreementLevels = Object.values(DisagreementLevelEnum) as number[];
const priorityLevels = Object.values(PriorityEnum) as number[];

export const ManagerFiltersSection = ({ filters, loading, onFilterChange, onApplyFilters, onClearFilters }: FiltersSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="w-full md:col-span-3">
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
        </div>

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
        </div>

        <div className="w-full md:col-span-3">
          <label className="mb-2 block text-sm font-medium text-gray-500">Search</label>
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search note ID or practitioner..."
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
