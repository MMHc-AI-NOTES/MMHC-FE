// @/components/data-table/DataTableSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface DataTableSkeletonProps {
  // Table configuration
  columnCount?: number;
  rowCount?: number;
  columnWidths?: string[];
  showHeader?: boolean;

  // Filter configuration
  showFilters?: boolean;
  filterCount?: number;
  filterWidths?: string[];

  // Search configuration
  showSearch?: boolean;
  searchWidth?: string;

  // Customization
  className?: string;
  cellClassName?: string;
}

export const DataTableSkeleton = ({
  columnCount = 5,
  rowCount = 5,
  columnWidths = [],
  showHeader = true,
  showFilters = true,
  filterCount = 2,
  filterWidths = ['w-64', 'w-32'],
  showSearch = true,
  searchWidth = 'w-64',
  className = '',
  cellClassName = '',
}: DataTableSkeletonProps) => {
  // Generate default column widths if not provided
  const getColumnWidth = (index: number) => {
    if (columnWidths[index]) return columnWidths[index];

    // Default widths based on common table patterns
    const defaultWidths = [
      'w-20', // ID column
      'w-32', // Name column
      'w-40', // Description/Date column
      'w-24', // Status column
      'w-20', // Actions column
    ];

    return defaultWidths[index] || 'w-32';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Loading Skeleton for Filters and Search */}
      {(showFilters || showSearch) && (
        <div className="flex flex-wrap justify-between">
          {/* Search Skeleton */}
          {showSearch && <Skeleton className={`h-10 ${searchWidth}`} />}

          <div className="flex flex-wrap gap-4">
            {/* Filter Skeletons */}
            {showFilters &&
              Array.from({ length: filterCount }).map((_, index) => (
                <Skeleton key={index} className={`h-10 ${filterWidths[index] || 'w-32'}`} />
              ))}
          </div>
        </div>
      )}

      {/* Loading Skeleton for Table */}
      <div className="rounded-md border">
        <Table>
          {showHeader && (
            <TableHeader>
              <TableRow>
                {Array.from({ length: columnCount }).map((_, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className={`h-4 ${getColumnWidth(colIndex)} ${cellClassName}`} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
