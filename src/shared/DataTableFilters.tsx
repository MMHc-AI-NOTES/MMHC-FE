// @/components/data-table/DataTableFilters.tsx
import { useState } from 'react';
import { Search, Check, ChevronsUpDown, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface FilterOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DataTableFilter {
  id: string;
  label: string;
  options: FilterOption[];
  type?: 'single' | 'multiple';
}

interface DataTableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: DataTableFilter[];
  selectedFilters: Record<string, string | string[]>;
  onFilterChange: (filterId: string, value: string | string[]) => void;
  onClearAllFilters?: () => void;
  showSearch?: boolean;
}

export const DataTableFilters = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  selectedFilters,
  onFilterChange,
  onClearAllFilters,
  showSearch = true,
}: DataTableFiltersProps) => {
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);

  const handleFilterSelect = (filterId: string, value: string, type: 'single' | 'multiple' = 'single') => {
    if (type === 'multiple') {
      const currentValues = (selectedFilters[filterId] as string[]) || [];
      const newValues = currentValues.includes(value) ? currentValues.filter(v => v !== value) : [...currentValues, value];

      onFilterChange(filterId, newValues);
    } else {
      const currentValue = selectedFilters[filterId] as string;
      onFilterChange(filterId, currentValue === value ? '' : value);
    }
  };

  //   const removeFilter = (filterId: string, valueToRemove: string) => {
  //     const currentValues = (selectedFilters[filterId] as string[]) || [];
  //     const newValues = currentValues.filter(v => v !== valueToRemove);
  //     onFilterChange(filterId, newValues);
  //   };

  const clearAllFilters = () => {
    filters.forEach(filter => {
      onFilterChange(filter.id, filter.type === 'multiple' ? [] : '');
    });
    onClearAllFilters?.();
  };

  const hasActiveFilters = filters.some(filter => {
    const value = selectedFilters[filter.id];
    return Array.isArray(value) ? value.length > 0 : value !== '';
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Row */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        {/* Search Input */}
        {showSearch && (
          <div className="relative max-w-sm flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input placeholder={searchPlaceholder} value={searchTerm} onChange={e => onSearchChange(e.target.value)} className="pl-10" />
          </div>
        )}

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-2">
          {filters.map(filter => {
            const selectedValue = selectedFilters[filter.id];
            const isMultiple = filter.type === 'multiple';
            const selectedValues = isMultiple ? (selectedValue as string[]) || [] : [];
            const singleValue = isMultiple ? '' : (selectedValue as string) || '';

            const selectedLabels = isMultiple
              ? selectedValues.map(value => filter.options.find(opt => opt.value === value)?.label || value)
              : [filter.options.find(opt => opt.value === singleValue)?.label];

            return (
              <Popover key={filter.id} open={openFilterId === filter.id} onOpenChange={open => setOpenFilterId(open ? filter.id : null)}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 border-dashed">
                    <Filter className="mr-2 h-4 w-4" />
                    {filter.label}
                    {selectedLabels.some(label => label) && (
                      <>
                        <div className="ml-2 hidden space-x-1 lg:flex">
                          {isMultiple && selectedValues.length > 2 ? (
                            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                              {selectedValues.length} selected
                            </Badge>
                          ) : (
                            selectedLabels.filter(Boolean).map((label, index) => (
                              <Badge key={index} variant="secondary" className="rounded-sm px-1 font-normal">
                                {label}
                              </Badge>
                            ))
                          )}
                        </div>
                      </>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder={`Search ${filter.label.toLowerCase()}...`} />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {filter.options.map(option => {
                          const isSelected = isMultiple ? selectedValues.includes(option.value) : singleValue === option.value;

                          return (
                            <CommandItem
                              key={option.value}
                              onSelect={() => handleFilterSelect(filter.id, option.value, filter.type)}
                              className="flex items-center gap-2"
                            >
                              <div
                                className={cn(
                                  'border-primary flex h-4 w-4 items-center justify-center rounded-sm border',
                                  isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible',
                                )}
                              >
                                <Check className="h-4 w-4" />
                              </div>
                              {option.icon && <option.icon className="text-muted-foreground h-4 w-4" />}
                              <span>{option.label}</span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                      {(isMultiple ? selectedValues.length > 0 : singleValue) && (
                        <>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => onFilterChange(filter.id, isMultiple ? [] : '')}
                              className="justify-center text-center"
                            >
                              Clear filter
                            </CommandItem>
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            );
          })}

          {/* Clear All Filters Button */}
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearAllFilters} className="h-10 px-3 lg:px-2">
              Clear all
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.map(filter => {
            const value = selectedFilters[filter.id];
            if (!value || (Array.isArray(value) && value.length === 0)) return null;

            const values = Array.isArray(value) ? value : [value];

            return values.map(val => {
              const option = filter.options.find(opt => opt.value === val);
              if (!option) return null;

              return (
                <Badge key={`${filter.id}-${val}`} variant="secondary" className="rounded-sm px-2 py-1 font-normal">
                  {filter.label}: {option.label}
                  <button
                    onClick={() => (filter.type === 'multiple' ? removeFilter(filter.id, val) : onFilterChange(filter.id, ''))}
                    className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <span className="sr-only">Remove</span>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            });
          })}
        </div>
      )} */}
    </div>
  );
};
