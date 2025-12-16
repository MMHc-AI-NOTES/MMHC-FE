import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChatSeverityEnum,
  ChatSeverityLabels,
  BlacklistReasonEnum,
  BlacklistReasonLabels,
  BlacklistStatusEnum,
  BlacklistStatusLabels,
} from '@/constants/common';
import { PractitionerOption } from '@/types/notes';
import { getEnumValues } from '@/utils/helper';

interface BlacklistedNotesFilters {
  severity: string;
  reason: string;
  practitioner: string;
  status: string;
}

interface FiltersSectionProps {
  filters: BlacklistedNotesFilters;
  practitioners: PractitionerOption[];
  loading: boolean;
  onFilterChange: (key: string, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export const FiltersSection = ({
  filters,
  practitioners,
  loading,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}: FiltersSectionProps) => {
  const severityOptions = getEnumValues(ChatSeverityEnum);
  const reasonOptions = getEnumValues(BlacklistReasonEnum);
  const statusOptions = getEnumValues(BlacklistStatusEnum);

  return (
    <div className="flex flex-wrap justify-between gap-3 px-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1.5 text-sm">Severity:</span>
          <Select value={filters.severity} onValueChange={value => onFilterChange('severity', value)}>
            <SelectTrigger className="h-9 border-gray-200 bg-white">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              {severityOptions.map(option => (
                <SelectItem key={option} value={option.toString()}>
                  {ChatSeverityLabels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reason Filter */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1.5 text-sm">Reason:</span>
          <Select value={filters.reason} onValueChange={value => onFilterChange('reason', value)}>
            <SelectTrigger className="h-9 border-gray-200 bg-white">
              <SelectValue placeholder="All Reasons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reasons</SelectItem>
              {reasonOptions.map(option => (
                <SelectItem key={option} value={option.toString()}>
                  {BlacklistReasonLabels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Practitioner Filter */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1.5 text-sm">Practitioner:</span>
          <Select value={filters.practitioner} onValueChange={value => onFilterChange('practitioner', value)}>
            <SelectTrigger className="h-9 border-gray-200 bg-white">
              <SelectValue placeholder="All Practitioners" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Practitioners</SelectItem>
              {practitioners.map(p => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1.5 text-sm">Status:</span>
          <Select value={filters.status} onValueChange={value => onFilterChange('status', value)}>
            <SelectTrigger className="h-9 border-gray-200 bg-white">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map(option => (
                <SelectItem key={option} value={option.toString()}>
                  {BlacklistStatusLabels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Apply and Reset Buttons */}
      <div className="flex items-center">
        <Button onClick={onApplyFilters} disabled={loading} size="lg">
          Apply
        </Button>
        <Button variant="ghost" onClick={onClearFilters} disabled={loading} className="text-primary">
          Clear Filters
        </Button>
      </div>
    </div>
  );
};
