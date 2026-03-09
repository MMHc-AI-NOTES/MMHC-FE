import { useState, useEffect } from 'react';
import { BlacklistedNotesTable } from './BlacklistedNotesTable';
import { FiltersSection } from './FiltersSection';
import { DataTablePagination } from '@/shared/DataTablePagination';
import { BlacklistedNote } from '@/types/blacklistedNotes';
import { fetchBlacklistedNotes } from './blacklistedNotesApiCalls';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import BlacklistedNotesDetailsSection from './BlacklistedNotesDetailsSection';
import { FileText } from 'lucide-react';
import { useFilterPersistence } from '@/hooks/useFilterPersistence';
import { SelectedNoteSummaryCard } from './SelectedNoteSummaryCard';
import { useAppSelector } from '@/store/store';
import { fetchPractitioners } from '../notesQueue/notesApiCalls';
import { setPractitioners } from '@/store/slices/filterOptionsSlice';
import { useDispatch } from 'react-redux';
import { DEFAULT_ITEMS_PER_PAGE } from '@/constants/common';

const BlacklistedNotes = () => {
  const dispatch = useDispatch();
  const [notes, setNotes] = useState<BlacklistedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<BlacklistedNote | null>(null);
  const [selectedNoteIds, setSelectedNoteIds] = useState<number[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = DEFAULT_ITEMS_PER_PAGE;

  // Get practitioners from Redux store
  const { practitioners, practitionersLoaded } = useAppSelector(state => state.filterOptions);

  // Filter states with persistence
  const defaultFilters = { severity: 'all', reason: 'all', practitioner: 'all', status: 'all' };
  const [filters, setFilters, clearPersistedFilters] = useFilterPersistence('blacklistedNotesFilters', defaultFilters);

  // Build filter payload for API
  const buildFilterPayload = () => {
    const filterArray: any[] = [];

    // Severity filter
    if (filters.severity && filters.severity !== 'all') {
      filterArray.push({ columnName: 'severity_id', type: 'exact', value: parseInt(filters.severity) });
    }

    // Reason filter
    if (filters.reason && filters.reason !== 'all') {
      filterArray.push({ columnName: 'blacklist_reason_id', type: 'exact', value: parseInt(filters.reason) });
    }

    // Practitioner filter
    if (filters.practitioner && filters.practitioner !== 'all') {
      filterArray.push({ columnName: 'practitioner_id', type: 'exact', value: parseInt(filters.practitioner) });
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filterArray.push({ columnName: 'status_id', type: 'exact', value: parseInt(filters.status) });
    }

    return { page: currentPage, pageSize: itemsPerPage, filters: filterArray };
  };

  // Load notes - apply saved filters if they exist
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true);
        setCurrentPage(1);
        setSelectedNote(null);
        setSelectedNoteIds([]);

        // Check if filters are active (not all defaults)
        const hasActive =
          filters.severity !== 'all' || filters.reason !== 'all' || filters.practitioner !== 'all' || filters.status !== 'all';

        let payload;
        if (hasActive) {
          payload = buildFilterPayload();
          payload.page = 1;
        } else {
          payload = { page: 1, pageSize: itemsPerPage, filters: [] };
        }

        const response = await fetchBlacklistedNotes(payload);
        setNotes(response.data);
        setTotalItems(response.totalCount || 0);
      } catch (error) {
        console.error('Error loading blacklisted notes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - filters are loaded from localStorage on mount

  // Handle filter changes (updates local state only)
  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  // Apply filters - makes API call with current filter values
  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      setCurrentPage(1);
      setSelectedNote(null);
      setSelectedNoteIds([]);

      const payload = buildFilterPayload();
      payload.page = 1; // Reset to first page
      const response = await fetchBlacklistedNotes(payload);

      setNotes(response.data);
      setTotalItems(response.totalCount || 0);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear filters - resets all filters and fetches unfiltered data
  const handleClearFilters = async () => {
    clearPersistedFilters();
    setCurrentPage(1);
    setSelectedNote(null);
    setSelectedNoteIds([]);

    try {
      setLoading(true);
      const payload = { page: 1, pageSize: itemsPerPage, filters: [] };
      const response = await fetchBlacklistedNotes(payload);
      setNotes(response.data);
      setTotalItems(response.totalCount || 0);
    } catch (error) {
      console.error('Error clearing filters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    setSelectedNote(null);
    setSelectedNoteIds([]);

    try {
      setLoading(true);
      const payload = buildFilterPayload();
      payload.page = page;

      const response = await fetchBlacklistedNotes(payload);
      setNotes(response.data);
      setTotalItems(response.totalCount || 0);
    } catch (error) {
      console.error('Error changing page:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle note selection for viewing details (when clicking Review button)
  const handleSelectNote = (note: BlacklistedNote) => {
    setSelectedNote(note);
  };

  // Handle note checkbox toggle
  const handleToggleNoteSelection = (noteId: number) => {
    setSelectedNoteIds(prev => (prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]));
  };

  // Handle toggle all notes
  const handleToggleAll = () => {
    if (selectedNoteIds.length === notes.length) {
      setSelectedNoteIds([]);
    } else {
      setSelectedNoteIds(notes.map(note => note.id));
    }
  };

  // Handle review action - selects note for viewing details
  const handleReview = (note: BlacklistedNote) => {
    handleSelectNote(note);
  };

  // Handle resolution actions
  const handleApplyAction = (action: number, comment: string) => {
    console.log('Applying action:', action, 'with comment:', comment);
    // Implement action logic here
  };

  const handleSaveDraft = (action: number, comment: string) => {
    console.log('Saving draft:', action, 'with comment:', comment);
    // Implement save draft logic here
  };

  const handleCancel = () => {
    setSelectedNote(null);
  };

  // Handle bulk actions
  const handleReRunAudit = () => {
    console.log('Re-running AI audit for selected notes:', selectedNoteIds);
    // Implement re-run logic here
  };

  const handleAssignReviewer = () => {
    console.log('Assigning reviewer for selected notes:', selectedNoteIds);
    // Implement assign reviewer logic here
  };

  const handleClearFromBlocklist = () => {
    console.log('Clearing from blocklist for selected notes:', selectedNoteIds);
    // Implement clear from blocklist logic here
  };

  useEffect(() => {
    const loadPractitioners = async () => {
      if (practitionersLoaded) return; // Skip if already loaded
      try {
        const practitionersData = await fetchPractitioners();
        dispatch(setPractitioners(practitionersData));
      } catch (error) {
        console.error('Error loading practitioners:', error);
      }
    };
    loadPractitioners();
  }, [practitionersLoaded, dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-primary text-2xl font-bold">Blocked Notes (Blacklisted Notes)</h1>
        <p className="text-muted-foreground text-sm">{totalItems} total blocked Notes</p>
      </div>

      {/* Selected Note Summary Card - Only show when at least one row is selected */}
      {selectedNoteIds.length > 0 && (
        <SelectedNoteSummaryCard
          selectedCount={selectedNoteIds.length}
          onReRunAudit={handleReRunAudit}
          onAssignReviewer={handleAssignReviewer}
          onClearFromBlocklist={handleClearFromBlocklist}
        />
      )}

      {/* Filters and Table */}
      <Card>
        <FiltersSection
          filters={filters}
          practitioners={practitioners}
          loading={loading}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Table */}
        <div className="pb-4">
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
              <BlacklistedNotesTable
                notes={notes}
                selectedNoteIds={selectedNoteIds}
                onToggleNoteSelection={handleToggleNoteSelection}
                onToggleAll={handleToggleAll}
                onReview={handleReview}
              />

              {/* Pagination */}
              {notes.length > 0 && (
                <div className="mt-6 mr-4">
                  <DataTablePagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalItems / itemsPerPage)}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={() => {}}
                    itemName="note"
                    itemNamePlural="notes"
                    itemsPerPageOptions={[20]}
                    showFirstLastButtons={true}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Note Details Section */}
      {selectedNote ? (
        <BlacklistedNotesDetailsSection
          note={selectedNote}
          onApplyAction={handleApplyAction}
          onSaveDraft={handleSaveDraft}
          onCancel={handleCancel}
        />
      ) : (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="mb-2 h-16 w-16 text-gray-300" />
            <p className="text-primary mb-2 text-xl font-semibold">No Note Selected</p>
            <p className="text-sm text-gray-500">
              Select a note from the table above or click "Review" to view detailed information,
              <br />
              review history, and resolution actions.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BlacklistedNotes;
