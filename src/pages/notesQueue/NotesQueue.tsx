// @/pages/notesQueue/NotesQueue.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotesTable } from './NotesTable';
import { FiltersSection } from './FiltersSection';
import { DataTablePagination } from '@/shared/DataTablePagination';
import { FormattedNote, QueueOverview, Workload, PractitionerOption, CptCodeOption } from '@/types/notes';
import { fetchNotes, fetchQueueOverview, fetchWorkload, fetchPractitioners, fetchCptCodes, getDateRange } from './notesApiCalls';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QueueOverviewCard } from './QueueOverviewCard';
import { WorkloadCard } from './WorkloadCard';

const NotesQueue = () => {
  const [notes, setNotes] = useState<FormattedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [queueOverview, setQueueOverview] = useState<QueueOverview | null>(null);
  const [workload, setWorkload] = useState<Workload | null>(null);
  const [practitioners, setPractitioners] = useState<PractitionerOption[]>([]);
  const [cptCodes, setCptCodes] = useState<CptCodeOption[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20; // Fixed at 20 as per requirement

  // Filter states
  const [filters, setFilters] = useState({
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
  });

  const navigate = useNavigate();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // Initial payload
        const initialPayload = {
          page: 1,
          pageSize: itemsPerPage,
          filters: [],
        };

        // Fetch all data in parallel
        const [notesResponse, overviewData, workloadData, practitionersData, cptCodesData] = await Promise.all([
          fetchNotes(initialPayload),
          fetchQueueOverview(),
          fetchWorkload(),
          fetchPractitioners(),
          fetchCptCodes(),
        ]);

        setNotes(notesResponse.data);
        setTotalItems(notesResponse.totalCount || 0);
        setQueueOverview(overviewData);
        setWorkload(workloadData);
        setPractitioners(practitionersData);
        setCptCodes(cptCodesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle filter changes (updates local state only)
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Build filter payload in the new format
  const buildFilterPayload = () => {
    const filterArray: any[] = [];

    // Note Type filter
    if (filters.noteType && filters.noteType !== 'all') {
      filterArray.push({
        columnName: 'type',
        type: 'exact',
        value: parseInt(filters.noteType),
      });
    }

    // Practitioner filter
    if (filters.practitioner && filters.practitioner !== 'all') {
      filterArray.push({
        columnName: 'practitioner_id',
        type: 'exact',
        value: parseInt(filters.practitioner),
      });
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      filterArray.push({
        columnName: 'priority',
        type: 'exact',
        value: parseInt(filters.priority),
      });
    }

    // CPT Code filter
    if (filters.cptCode && filters.cptCode !== 'all') {
      filterArray.push({
        columnName: 'patient_id',
        type: 'exact',
        value: parseInt(filters.cptCode),
      });
    }

    // AI Status filter
    if (filters.aiStatus && filters.aiStatus !== 'all') {
      filterArray.push({
        columnName: 'ai_status',
        type: 'exact',
        value: parseInt(filters.aiStatus),
      });
    }

    // Workflow filter
    if (filters.workflow && filters.workflow !== 'all') {
      filterArray.push({
        columnName: 'workflow',
        type: 'exact',
        value: parseInt(filters.workflow),
      });
    }

    // Search filter
    if (filters.search) {
      filterArray.push({
        columnName: 'search',
        type: 'like',
        value: filters.search,
      });
    }

    // Date Range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const dateRange = getDateRange(filters.dateRange);
      if (dateRange) {
        filterArray.push({
          columnName: 'created_at',
          type: 'date_range',
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });
      }
    }

    return {
      page: currentPage,
      pageSize: itemsPerPage,
      filters: filterArray,
    };
  };

  // Apply filters - makes API call with current filter values
  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      setCurrentPage(1); // Reset to first page on filter apply

      const payload = buildFilterPayload();
      const response = await fetchNotes(payload);

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
    const clearedFilters = {
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
    };

    setFilters(clearedFilters);
    setCurrentPage(1);

    try {
      setLoading(true);
      const payload = {
        page: 1,
        pageSize: itemsPerPage,
        filters: [],
      };
      const response = await fetchNotes(payload);
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

    try {
      setLoading(true);
      const payload = buildFilterPayload();
      payload.page = page; // Update the page number

      const response = await fetchNotes(payload);
      setNotes(response.data);
      setTotalItems(response.totalCount || 0);
    } catch (error) {
      console.error('Error changing page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewNote = (noteId: string) => {
    navigate(`/notes-queue/single-note-audit/${noteId}`);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Column: Table with Filters */}
      <div className="lg:col-span-8">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Filters Section */}
            <FiltersSection
              filters={filters}
              practitioners={practitioners}
              cptCodes={cptCodes}
              loading={loading}
              onFilterChange={handleFilterChange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />

            {/* All Notes Section */}
            <div>
              <div className="mb-4">
                <h3 className="text-primary text-lg font-semibold">All Notes</h3>
                <p className="text-muted-foreground text-sm">{notes.length} notes in queue</p>
              </div>

              {loading ? (
                <div className="space-y-3">
                  <div className="rounded-md border">
                    <div className="space-y-3 p-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-12 flex-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <NotesTable notes={notes} onViewNote={handleViewNote} />

                  {/* Pagination */}
                  {notes.length > 0 && (
                    <div className="mt-6">
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
          </div>
        </Card>
      </div>

      {/* Right Column: Overview Cards */}
      <div className="space-y-6 lg:col-span-4">
        <QueueOverviewCard
          data={
            queueOverview || {
              total_notes: 0,
              ai_passed: 0,
              ai_failed: 0,
              pending_human_review: 0,
              pending_manager_review: 0,
              blacklist: 0,
            }
          }
          loading={loading && !queueOverview}
        />
        <WorkloadCard
          data={workload || { notesAssignedToYou: 0, avgReviewTime: '0 min', returnRate: '0%', aiDisagreementRate: '0%' }}
          loading={loading && !workload}
        />
      </div>
    </div>
  );
};

export default NotesQueue;
