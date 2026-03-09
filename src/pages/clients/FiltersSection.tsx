import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ClientsFilters {
  search: string;
}

interface FiltersSectionProps {
  filters: ClientsFilters;
  loading: boolean;
  onFilterChange: (key: string, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export const FiltersSection = ({ filters, loading, onFilterChange, onApplyFilters, onClearFilters }: FiltersSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="w-full md:max-w-md">
          <label className="mb-2 block text-sm font-medium text-gray-500">Search Clients</label>
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search by client ID"
              value={filters.search}
              onChange={e => onFilterChange('search', e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>
        <div className="flex gap-3 md:justify-end">
          <Button className="bg-white text-black" variant="outline" onClick={onClearFilters} disabled={loading} size="lg">
            Clear
          </Button>
          <Button onClick={onApplyFilters} disabled={loading} size="lg">
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};
