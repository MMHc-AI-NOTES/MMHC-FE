import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ManagerTable } from './ManagerTable';
import { ManagerColorKey } from './ManagerColorKey';
import { ManagerOverviewCard } from './ManagerOverviewCard';
import { ManagerDecisionBreakdownCard } from './ManagerDecisionBreakdownCard';
import { ManagerNote, ManagerOverview } from './managerReviewTypes';
import { fetchManagerNotes, fetchManagerOverview } from './managerReviewApi';
import { ManagerFiltersSection } from './ManagerFiltersSection';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTablePagination } from '@/shared/DataTablePagination';
import { useFilterPersistence } from '@/hooks/useFilterPersistence';

const defaultFilters = {
  humanDecision: 'all' as number | 'all',
  disagreement: 'all' as number | 'all',
  priority: 'all' as number | 'all',
  search: '',
};

export const ManagerReviewQueue = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<ManagerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<ManagerOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination (dummy for now - client-side only, same shape as NotesQueue)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  const [filters, setFilters, clearPersistedFilters] = useFilterPersistence('managerReviewFilters', defaultFilters);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setOverviewLoading(true);

      const [notesData, overviewData] = await Promise.all([fetchManagerNotes(), fetchManagerOverview()]);

      setNotes(notesData);
      setTotalItems(notesData.length);
      setCurrentPage(1);

      setOverview(overviewData);

      setLoading(false);
      setOverviewLoading(false);
    };

    loadData();
  }, []);

  const handleReview = (id: string) => {
    navigate(`/manager-review/single-review/${id}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    const payload: Partial<ManagerNote> & { search?: string } = {};
    if (filters.humanDecision !== 'all') payload.humanDecision = filters.humanDecision;
    if (filters.priority !== 'all') payload.priority = filters.priority;
    if (filters.disagreement !== 'all') payload.disagreement = filters.disagreement;
    if (filters.search) payload.search = filters.search;
    const data = await fetchManagerNotes(payload);
    setNotes(data);
    setTotalItems(data.length);
    setCurrentPage(1);
    setSelectedIds([]);
    setLoading(false);
  };

  const handleClearFilters = async () => {
    clearPersistedFilters();
    setLoading(true);
    const data = await fetchManagerNotes();
    setNotes(data);
    setTotalItems(data.length);
    setCurrentPage(1);
    setSelectedIds([]);
    setLoading(false);
  };

  const toggleRow = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selectedIds.length === notes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notes.map(n => n.id));
    }
  };

  // For now, pagination is client-side only. When API supports it, this can call fetchManagerNotes with page info.
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotes = notes.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-9">
          <Card className="p-6">
            <ManagerFiltersSection
              filters={filters}
              loading={loading}
              onFilterChange={handleFilterChange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
          </Card>
          <Card>
            <div className="flex items-center justify-between px-6 py-2">
              <div>
                <h3 className="text-primary text-lg font-semibold">Manager Review Queue</h3>
                <p className="text-muted-foreground text-sm">{notes.length} notes awaiting manager review</p>
              </div>
              <div className="flex items-center gap-3">
                {selectedIds.length ? (
                  <Button variant="outline" size="lg" className="bg-primary-light text-primary font-semibold">
                    <Sparkles className="h-4 w-4" />
                    Ready for AI Training ({selectedIds.length})
                  </Button>
                ) : null}

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="lg" className="hover:border-green-300 hover:bg-green-50">
                      <Info />
                      Color Key
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 shadow-lg lg:w-xl" align="end" side="bottom" avoidCollisions={false}>
                    <ManagerColorKey />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {loading ? (
              <div className="space-y-3">
                <div className="space-y-3 p-4">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <ManagerTable
                  notes={paginatedNotes}
                  onReview={handleReview}
                  selectedIds={selectedIds}
                  onToggleRow={toggleRow}
                  onToggleAll={toggleAll}
                />

                {/* Pagination */}
                {notes.length > 0 && (
                  <div className="mt-6 mr-4">
                    <DataTablePagination
                      currentPage={currentPage}
                      totalPages={Math.max(1, Math.ceil(totalItems / itemsPerPage))}
                      itemsPerPage={itemsPerPage}
                      totalItems={totalItems}
                      onPageChange={handlePageChange}
                      onItemsPerPageChange={() => {}} // No-op since pageSize is fixed
                      itemName="note"
                      itemNamePlural="notes"
                      itemsPerPageOptions={[20]} // Only show 20 as it's fixed
                      showFirstLastButtons={true}
                    />
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-3">
          <ManagerOverviewCard data={overview} loading={overviewLoading} />
          <ManagerDecisionBreakdownCard data={overview} loading={overviewLoading} />
        </div>
      </div>
    </div>
  );
};

export default ManagerReviewQueue;
