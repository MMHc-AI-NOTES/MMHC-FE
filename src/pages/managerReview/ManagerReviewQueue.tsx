import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Send, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ManagerTable } from './ManagerTable';
import { ManagerColorKey } from './ManagerColorKey';
import { showToast } from '@/lib/toast';
// import { ManagerOverviewCard } from './ManagerOverviewCard';
// import { ManagerDecisionBreakdownCard } from './ManagerDecisionBreakdownCard';
import type {
  ManagerBulkSendNoteItem,
  ManagerNote, // ManagerOverview
} from './managerReviewTypes';
import { fetchManagerNotes, bulkSendToPractitioner } from './managerReviewApiCalls';
import { ManagerFiltersSection } from './ManagerFiltersSection';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTablePagination } from '@/shared/DataTablePagination';
import { useFilterPersistence } from '@/hooks/useFilterPersistence';
import { ManagerBulkSendDialog } from './ManagerBulkSendDialog';
import { formatDateTime } from '@/utils/helper';

const defaultFilters = {
  humanDecision: 'all',
  disagreement: 'all',
  priority: 'all',
  practitioner: 'all',
  reviewer: 'all',
  search: '',
};

const getReviewerId = (note: ManagerNote): number | null =>
  note.rawData?.smeIssues?.[0]?.reviewerId ?? note.rawData?.smeIssues?.[0]?.reviewer?.id ?? null;

const getVersionId = (note: ManagerNote): number | null => {
  const versionFromIssue = note.rawData?.smeIssues?.[0]?.versionId;
  if (versionFromIssue !== undefined && versionFromIssue !== null) {
    return versionFromIssue;
  }

  const versionFromWebhook = note.rawData?.webhookVersions?.reduce<number | null>(
    (maxVersionId, version) => (maxVersionId === null || version.id > maxVersionId ? version.id : maxVersionId),
    null,
  );

  return versionFromWebhook ?? null;
};

const getIssueDescription = (issue: NonNullable<ManagerNote['rawData']>['smeIssues'][number]): string =>
  issue.issueDescription?.description || issue.description || issue.comment || 'No description provided';

const mapIssuesForBulkDialog = (note: ManagerNote): ManagerBulkSendNoteItem['issues'] =>
  (note.rawData?.smeIssues || []).map((issue, index) => ({
    id: issue.id?.toString() || `${note.id}-issue-${index}`,
    errorType: issue.errorType?.displayName || issue.errorType?.name || 'General Issue',
    relatedTo: issue.issuesRelatedTo?.displayName || issue.category || 'General',
    description: getIssueDescription(issue),
    comment: issue.comment || null,
    points: issue.errorType?.points ?? issue.points ?? null,
  }));

export const ManagerReviewQueue = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<ManagerNote[]>([]);
  const [loading, setLoading] = useState(true);
  // const [overview, setOverview] = useState<ManagerOverview | null>(null);
  // const [overviewLoading, setOverviewLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkSendDialogOpen, setIsBulkSendDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Pagination (dummy for now - client-side only, same shape as NotesQueue)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  const [filters, setFilters, clearPersistedFilters] = useFilterPersistence('managerReviewFilters', defaultFilters);

  const selectedNoteItems = useMemo<ManagerBulkSendNoteItem[]>(
    () =>
      notes
        .filter(note => selectedIds.includes(note.id.toString()))
        .map(note => ({
          id: note.id.toString(),
          noteId: note.noteId,
          practitionerName: note.practitioner || 'Unknown',
          practitionerEmail: note.rawData?.practitioner?.email || null,
          practitionerId: note.rawData?.practitionerId ?? note.rawData?.practitioner?.id ?? null,
          reviewerId: getReviewerId(note),
          reviewerName: note.reviewer || 'Unknown',
          versionId: getVersionId(note),
          date: note.date || 'N/A',
          aiScore: note.aiScore || 0,
          humanScore: note.humanScore ?? null,
          issues: mapIssuesForBulkDialog(note),
        })),
    [notes, selectedIds],
  );

  const buildFilterPayload = () => {
    const filterArray: any[] = [];

    // Note Type filter
    if (filters.humanDecision && filters.humanDecision !== 'all') {
      filterArray.push({ columnName: 'human_decision', type: 'exact', value: parseInt(filters.humanDecision) });
    }

    // Practitioner filter
    if (filters.disagreement && filters.disagreement !== 'all') {
      filterArray.push({ columnName: 'disagreement', type: 'exact', value: parseInt(filters.disagreement) });
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      filterArray.push({ columnName: 'priority', type: 'exact', value: filters.priority });
    }

    // Practitioner ID filter
    if (filters.practitioner && filters.practitioner !== 'all') {
      filterArray.push({ columnName: 'practitioner_id', type: 'exact', value: parseInt(filters.practitioner) });
    }

    // Reviewer ID filter
    if (filters.reviewer && filters.reviewer !== 'all') {
      filterArray.push({ columnName: 'reviewer_id', type: 'exact', value: parseInt(filters.reviewer) });
    }

    // Search filter
    if (filters.search) {
      filterArray.push({ columnName: 'search', type: 'like', value: filters.search });
    }

    return { page: currentPage, pageSize: itemsPerPage, filters: filterArray };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // setOverviewLoading(true);
        setCurrentPage(1);

        // Check if filters are active (not all defaults)
        const hasActiveFilters =
          filters.humanDecision !== 'all' ||
          filters.disagreement !== 'all' ||
          filters.priority !== 'all' ||
          filters.practitioner !== 'all' ||
          filters.reviewer !== 'all' ||
          filters.search !== '';

        let payload;
        if (hasActiveFilters) {
          // Build filter payload for persisted filters
          const filterArray: any[] = [];

          if (filters.humanDecision && filters.humanDecision !== 'all') {
            filterArray.push({ columnName: 'human_decision', type: 'exact', value: parseInt(filters.humanDecision) });
          }
          if (filters.disagreement && filters.disagreement !== 'all') {
            filterArray.push({ columnName: 'disagreement', type: 'exact', value: parseInt(filters.disagreement) });
          }
          if (filters.priority && filters.priority !== 'all') {
            filterArray.push({ columnName: 'priority', type: 'exact', value: parseInt(filters.priority) });
          }
          if (filters.practitioner && filters.practitioner !== 'all') {
            filterArray.push({ columnName: 'practitioner_id', type: 'exact', value: parseInt(filters.practitioner) });
          }
          if (filters.reviewer && filters.reviewer !== 'all') {
            filterArray.push({ columnName: 'reviewer_id', type: 'exact', value: parseInt(filters.reviewer) });
          }
          if (filters.search) {
            filterArray.push({ columnName: 'search', type: 'like', value: filters.search });
          }

          payload = { page: 1, pageSize: itemsPerPage, filters: filterArray };
        } else {
          payload = { page: 1, pageSize: itemsPerPage, filters: [] };
        }

        const [notesResponse] = await Promise.all([fetchManagerNotes(payload)]);

        setNotes(notesResponse.data);
        setTotalItems(notesResponse.totalCount);

        // setOverview(overviewData);
      } catch (error) {
        console.error('Error loading manager review data:', error);
      } finally {
        setLoading(false);
        // setOverviewLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleReview = (note: ManagerNote) => {
    // Extract reviewer_id from smeIssues (get first reviewer_id if available)
    const reviewerId = note.rawData?.smeIssues?.[0]?.reviewerId || note.rawData?.smeIssues?.[0]?.reviewer?.id || null;

    navigate(`/manager-review/single-note-audit/${note.noteId}`, {
      state: {
        reviewerId,
        isManagerReviewing: true,
      },
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    const payload = buildFilterPayload();
    const response = await fetchManagerNotes(payload);
    setNotes(response.data);
    setTotalItems(response.totalCount);
    setCurrentPage(response.page);
    setSelectedIds([]);
    setIsBulkSendDialogOpen(false);
    setLoading(false);
  };

  const handleClearFilters = async () => {
    clearPersistedFilters();
    setLoading(true);
    const response = await fetchManagerNotes({ page: 1, pageSize: itemsPerPage, filters: [] });
    setNotes(response.data);
    setTotalItems(response.totalCount);
    setCurrentPage(response.page);
    setSelectedIds([]);
    setIsBulkSendDialogOpen(false);
    setLoading(false);
  };

  const toggleRow = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selectedIds.length === notes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notes.map(n => n.id.toString()));
    }
  };

  const loadNotesPage = async (page: number) => {
    const payload = buildFilterPayload();
    payload.page = page;

    const response = await fetchManagerNotes(payload);
    setNotes(response.data);
    setTotalItems(response.totalCount);
    setCurrentPage(response.page);

    return response;
  };

  const handleConfirmBulkSend = async () => {
    const ids = selectedIds.map(id => parseInt(id, 10)).filter(n => !Number.isNaN(n));
    if (ids.length === 0) {
      showToast.warning('Select at least one note first');
      return;
    }

    setIsSending(true);
    try {
      const sentAt = formatDateTime(new Date());
      const success = await bulkSendToPractitioner(ids);
      if (success) {
        setNotes(prev => prev.map(note => (selectedIds.includes(note.id.toString()) ? { ...note, emailSendDate: sentAt } : note)));
        setSelectedIds([]);
        setIsBulkSendDialogOpen(false);
      }
    } finally {
      setIsSending(false);
    }
  };

  // Server-side pagination
  const handlePageChange = async (page: number) => {
    setLoading(true);
    await loadNotesPage(page);
    setSelectedIds([]);
    setIsBulkSendDialogOpen(false);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-12">
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
                {selectedNoteItems.length ? (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-orange-dark text-orange-dark hover:bg-orange-dark/10 font-semibold"
                      onClick={() => setIsBulkSendDialogOpen(true)}
                    >
                      <Send className="h-4 w-4" />
                      Send to Practitioner ({selectedNoteItems.length})
                    </Button>
                    <Button variant="outline" size="lg" className="bg-primary-light text-primary font-semibold">
                      <Sparkles className="h-4 w-4" />
                      Ready for AI Training ({selectedNoteItems.length})
                    </Button>
                  </>
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
                  notes={notes}
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

          <ManagerBulkSendDialog
            open={isBulkSendDialogOpen}
            onOpenChange={setIsBulkSendDialogOpen}
            notes={selectedNoteItems}
            isSending={isSending}
            onConfirm={handleConfirmBulkSend}
          />
        </div>

        {/* <div className="space-y-4 lg:col-span-3">
          <ManagerOverviewCard data={overview} loading={overviewLoading} />
          <ManagerDecisionBreakdownCard data={overview} loading={overviewLoading} />
        </div> */}
      </div>
    </div>
  );
};

export default ManagerReviewQueue;
