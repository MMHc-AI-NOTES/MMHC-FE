// @/pages/notesQueue/NotesQueue.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotesTable } from './NotesTable';
import { FiltersSection } from './FiltersSection';
import { DataTablePagination } from '@/shared/DataTablePagination';
import {
  FormattedNote,
  QueueOverview,
  // Workload
} from '@/types/notes';
import {
  fetchNotes,
  fetchQueueOverview,
  // fetchWorkload,
  fetchPractitioners,
  fetchCptCodes,
  getDateRange,
  type NotesPayload,
} from './notesApiCalls';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QueueOverviewCard } from './QueueOverviewCard';
// import { WorkloadCard } from './WorkloadCard';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setPractitioners, setCptCodes } from '@/store/slices/filterOptionsSlice';
import { clearSelectedClientId } from '@/store/slices/selectedClientSlice';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ColorKey } from './ColorKey';
import { useFilterPersistence } from '@/hooks/useFilterPersistence';

const itemsPerPage = 60; // Fixed at 60 as per requirement

const NotesQueue = () => {
  const [notes, setNotes] = useState<FormattedNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [overviewLoading, setOverviewLoading] = useState(true);
  // const [workloadLoading, setWorkloadLoading] = useState(true);
  const [queueOverview, setQueueOverview] = useState<QueueOverview | null>(null);
  // const [workload, setWorkload] = useState<Workload | null>(null);
  const user = useAppSelector(state => state.auth.user);
  const selectedClientId = useAppSelector(state => state.selectedClient.selectedClientId);

  // Get filter options from Redux
  const dispatch = useAppDispatch();
  const { practitioners, cptCodes, practitionersLoaded, cptCodesLoaded } = useAppSelector(state => state.filterOptions);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Sorting state
  const [sorts, setSorts] = useState<
    {
      columnName: string;
      orderBy: 'asc' | 'desc';
    }[]
  >([{ columnName: 'session_time', orderBy: 'desc' }]);

  // Filter states with persistence
  const defaultFilters = {
    status: 'all',
    noteType: 'all',
    practitioner: 'all',
    reviewStage: 'all',
    priority: 'all',
    dateRange: 'all',
    cptCode: 'all',
    aiStatus: 'all',
    humanReview: 'all',
    manager: 'all',
    workflow: 'all',
    search: '',
    notReviewedByMe: true,
    notReviewedByAnyone: false,
  };
  const [filters, setFilters, clearPersistedFilters] = useFilterPersistence('notesQueueFilters', defaultFilters);

  const navigate = useNavigate();

  // Build filter payload in the new format
  const buildFilterPayload = (): NotesPayload => {
    const filterArray: any[] = [];

    // Note Type filter
    if (filters.noteType && filters.noteType !== 'all') {
      filterArray.push({ columnName: 'type', type: 'exact', value: parseInt(filters.noteType) });
    }

    // Practitioner filter
    if (filters.practitioner && filters.practitioner !== 'all') {
      filterArray.push({ columnName: 'practitioner_id', type: 'exact', value: parseInt(filters.practitioner) });
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      filterArray.push({ columnName: 'priority', type: 'exact', value: parseInt(filters.priority) });
    }

    // CPT Code filter
    if (filters.cptCode && filters.cptCode !== 'all') {
      filterArray.push({ columnName: 'cpt_code_id', type: 'exact', value: parseInt(filters.cptCode) });
    }

    // AI Status filter
    if (filters.aiStatus && filters.aiStatus !== 'all') {
      filterArray.push({ columnName: 'ai_status', type: 'exact', value: parseInt(filters.aiStatus) });
    }

    // Workflow filter
    if (filters.workflow && filters.workflow !== 'all') {
      filterArray.push({ columnName: 'workflow', type: 'exact', value: parseInt(filters.workflow) });
    }

    // Search filter
    if (filters.search) {
      filterArray.push({ columnName: 'search', type: 'like', value: filters.search });
    }

    // Date Range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const dateRange = getDateRange(filters.dateRange);
      if (dateRange) {
        filterArray.push({ columnName: 'session_time', type: 'exact', startDate: dateRange.startDate, endDate: dateRange.endDate });
      }
    }

    // Reviewed By Me filter
    if (filters.notReviewedByMe) {
      filterArray.push({ columnName: 'not_reviewed_by_user_id', type: 'exact', value: user?.id ?? 0 });
    }

    // Notes not reviewed by anyone filter
    if (filters.notReviewedByAnyone) {
      filterArray.push({ columnName: 'not_reviewed', value: true });
    }

    return { page: currentPage, pageSize: itemsPerPage, filters: filterArray, sorts };
  };

  // Load initial data - each API call has its own loading state
  useEffect(() => {
    // Fetch queue overview
    const loadQueueOverview = async () => {
      try {
        setOverviewLoading(true);
        const overviewData = await fetchQueueOverview();
        setQueueOverview(overviewData);
      } catch (error) {
        console.error('Error loading queue overview:', error);
      } finally {
        setOverviewLoading(false);
      }
    };

    // Fetch workload
    // const loadWorkload = async () => {
    //   try {
    //     setWorkloadLoading(true);
    //     const workloadData = await fetchWorkload();
    //     setWorkload(workloadData);
    //   } catch (error) {
    //     console.error('Error loading workload:', error);
    //   } finally {
    //     setWorkloadLoading(false);
    //   }
    // };

    // Fetch practitioners only if not already loaded in Redux
    const loadPractitioners = async () => {
      if (practitionersLoaded) return; // Skip if already loaded
      try {
        const practitionersData = await fetchPractitioners();
        dispatch(setPractitioners(practitionersData));
      } catch (error) {
        console.error('Error loading practitioners:', error);
      }
    };

    // Fetch CPT codes only if not already loaded in Redux
    const loadCptCodes = async () => {
      if (cptCodesLoaded) return; // Skip if already loaded
      try {
        const cptCodesData = await fetchCptCodes();
        dispatch(setCptCodes(cptCodesData));
      } catch (error) {
        console.error('Error loading CPT codes:', error);
      }
    };

    // Run non-note fetches in parallel
    loadQueueOverview();
    // loadWorkload();
    loadPractitioners();
    loadCptCodes();
  }, [practitionersLoaded, cptCodesLoaded, dispatch]);

  // Load notes - apply saved filters if they exist
  useEffect(() => {
    // If a client was selected from the Clients page, skip the initial unfiltered load.
    // The selected-client effect below will handle the first load instead.
    if (selectedClientId) {
      return;
    }

    const loadNotes = async () => {
      try {
        setNotesLoading(true);
        setCurrentPage(1);

        // Check if filters are active (not all defaults)
        const hasActive =
          filters.status !== 'all' ||
          filters.noteType !== 'all' ||
          filters.practitioner !== 'all' ||
          filters.reviewStage !== 'all' ||
          filters.priority !== 'all' ||
          filters.dateRange !== 'all' ||
          filters.cptCode !== 'all' ||
          filters.aiStatus !== 'all' ||
          filters.humanReview !== 'all' ||
          filters.manager !== 'all' ||
          filters.workflow !== 'all' ||
          filters.search !== '' ||
          filters.notReviewedByMe ||
          filters.notReviewedByAnyone;

        let payload: NotesPayload;
        if (hasActive) {
          // Build filter payload
          const filterArray: any[] = [];

          if (filters.noteType && filters.noteType !== 'all') {
            filterArray.push({ columnName: 'type', type: 'exact', value: parseInt(filters.noteType) });
          }
          if (filters.practitioner && filters.practitioner !== 'all') {
            filterArray.push({ columnName: 'practitioner_id', type: 'exact', value: parseInt(filters.practitioner) });
          }
          if (filters.priority && filters.priority !== 'all') {
            filterArray.push({ columnName: 'priority', type: 'exact', value: parseInt(filters.priority) });
          }
          if (filters.cptCode && filters.cptCode !== 'all') {
            filterArray.push({ columnName: 'cpt_code_id', type: 'exact', value: parseInt(filters.cptCode) });
          }
          if (filters.aiStatus && filters.aiStatus !== 'all') {
            filterArray.push({ columnName: 'ai_status', type: 'exact', value: parseInt(filters.aiStatus) });
          }
          if (filters.workflow && filters.workflow !== 'all') {
            filterArray.push({ columnName: 'workflow', type: 'exact', value: parseInt(filters.workflow) });
          }
          if (filters.search) {
            filterArray.push({ columnName: 'search', type: 'like', value: filters.search });
          }
          if (filters.dateRange && filters.dateRange !== 'all') {
            const dateRange = getDateRange(filters.dateRange);
            if (dateRange) {
              filterArray.push({ columnName: 'session_time', type: 'exact', startDate: dateRange.startDate, endDate: dateRange.endDate });
            }
          }
          if (filters.notReviewedByMe) {
            filterArray.push({ columnName: 'not_reviewed_by_user_id', type: 'exact', value: user?.id ?? 0 });
          }
          if (filters.notReviewedByAnyone) {
            filterArray.push({ columnName: 'not_reviewed', value: true });
          }

          payload = { page: 1, pageSize: itemsPerPage, filters: filterArray, sorts };
        } else {
          payload = { page: 1, pageSize: itemsPerPage, filters: [], sorts };
        }

        const notesResponse = await fetchNotes(payload);
        setNotes(notesResponse.data);
        setTotalItems(notesResponse.totalCount || 0);
      } catch (error) {
        console.error('Error loading notes:', error);
      } finally {
        setNotesLoading(false);
      }
    };

    void loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // If a client is selected from the Clients page, prefill the search filter and load notes for that client
  useEffect(() => {
    const applySelectedClientFilter = async () => {
      if (!selectedClientId) return;

      try {
        setNotesLoading(true);
        setCurrentPage(1);

        // Prefill the search filter so the FiltersSection shows the client identifier
        setFilters({
          ...filters,
          search: selectedClientId,
        });

        const payload: NotesPayload = {
          page: 1,
          pageSize: itemsPerPage,
          filters: [
            {
              columnName: 'search',
              type: 'like',
              value: selectedClientId,
            },
          ],
          sorts,
        };

        const notesResponse = await fetchNotes(payload);
        setNotes(notesResponse.data);
        setTotalItems(notesResponse.totalCount || 0);
      } catch (error) {
        console.error('Error applying selected client filter:', error);
      } finally {
        setNotesLoading(false);
        dispatch(clearSelectedClientId());
      }
    };

    void applySelectedClientFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId]);

  // Handle filter changes (updates local state only)
  const handleFilterChange = (key: string, value: string | boolean) => {
    // Special handling to keep review filters mutually exclusive
    if (key === 'notReviewedByAnyone') {
      const isChecked = value === true;
      setFilters({
        ...filters,
        notReviewedByAnyone: isChecked,
        notReviewedByMe: isChecked ? false : filters.notReviewedByMe,
      });
      return;
    }

    if (key === 'notReviewedByMe') {
      const isChecked = value === true;
      setFilters({
        ...filters,
        notReviewedByMe: isChecked,
        notReviewedByAnyone: isChecked ? false : filters.notReviewedByAnyone,
      });
      return;
    }

    setFilters({
      ...filters,
      [key]: value,
    });
  };

  // Apply filters - makes API call with current filter values
  const handleApplyFilters = async () => {
    try {
      setNotesLoading(true);
      setCurrentPage(1); // Reset to first page on filter apply

      const payload = buildFilterPayload();
      const response = await fetchNotes(payload);

      setNotes(response.data);
      setTotalItems(response.totalCount || 0);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  // Clear filters - resets all filters to defaults and fetches data
  const handleClearFilters = async () => {
    try {
      setNotesLoading(true);
      clearPersistedFilters();
      setCurrentPage(1);

      const resetFilters = { ...defaultFilters };
      setFilters(resetFilters);

      const filterArray: any[] = [];
      if (resetFilters.notReviewedByMe) {
        filterArray.push({ columnName: 'not_reviewed_by_user_id', type: 'exact', value: user?.id ?? 0 });
      }
      if (resetFilters.notReviewedByAnyone) {
        filterArray.push({ columnName: 'not_reviewed', value: true });
      }

      const response = await fetchNotes({ page: 1, pageSize: itemsPerPage, filters: filterArray, sorts });
      setNotes(response.data);
      setTotalItems(response.totalCount || 0);
    } catch (error) {
      console.error('Error clearing filters:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = async (page: number) => {
    setCurrentPage(page);

    try {
      setNotesLoading(true);
      const payload = buildFilterPayload();
      payload.page = page; // Update the page number

      const response = await fetchNotes(payload);
      setNotes(response.data);
      setTotalItems(response.totalCount || 0);
    } catch (error) {
      console.error('Error changing page:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleViewNote = (noteId: string) => {
    navigate(`/notes-queue/single-note-audit/${noteId}`);
  };

  // Handle sorting changes from table header
  const handleSortChange = async (columnName: string) => {
    // 3-state cycle: unsorted (no entry) -> desc -> asc -> unsorted
    const existing = sorts.find(sort => sort.columnName === columnName);

    let nextSorts:
      | {
          columnName: string;
          orderBy: 'asc' | 'desc';
        }[]
      | [] = [];

    if (!existing) {
      // Currently unsorted → apply desc
      nextSorts = [{ columnName, orderBy: 'desc' }];
    } else if (existing.orderBy === 'desc') {
      // Desc → asc
      nextSorts = [{ columnName, orderBy: 'asc' }];
    } else {
      // Asc → unsorted (empty array so backend uses default sort)
      nextSorts = [];
    }

    // Update state so icons reflect the new sort
    setSorts(nextSorts);

    try {
      setNotesLoading(true);
      setCurrentPage(1);

      const basePayload = buildFilterPayload();
      const payload: NotesPayload = {
        ...basePayload,
        page: 1,
        sorts: nextSorts,
      };

      const response = await fetchNotes(payload);
      setNotes(response.data);
      setTotalItems(response.totalCount || 0);
    } catch (error) {
      console.error('Error applying sort:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Column: Table with Filters */}
      <div className="space-y-6 lg:col-span-9">
        <Card className="p-6">
          <FiltersSection
            filters={filters}
            practitioners={practitioners}
            cptCodes={cptCodes}
            loading={notesLoading}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        </Card>
        <Card>
          <div>
            <div className="mb-4 flex items-center justify-between px-6">
              <div>
                <h3 className="text-primary text-lg font-semibold">All Notes</h3>
                <p className="text-muted-foreground text-sm">{notes.length} notes in queue</p>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="lg" className="hover:border-green-300 hover:bg-green-50">
                    <Info />
                    Color Key
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 shadow-lg lg:w-xl" align="end" side="bottom" avoidCollisions={false}>
                  <ColorKey />
                </PopoverContent>
              </Popover>
            </div>

            {notesLoading ? (
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
                <NotesTable
                  notes={notes}
                  onViewNote={handleViewNote}
                  page={currentPage}
                  pageSize={itemsPerPage}
                  sorts={sorts}
                  onSortChange={handleSortChange}
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
          </div>
        </Card>
      </div>

      {/* Right Column: Overview Cards */}
      <div className="space-y-6 lg:col-span-3">
        <QueueOverviewCard data={queueOverview} loading={overviewLoading} />
        {/* <WorkloadCard data={workload} loading={workloadLoading} /> */}
      </div>
    </div>
  );
};

export default NotesQueue;
