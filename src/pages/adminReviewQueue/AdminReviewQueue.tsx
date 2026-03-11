// @/pages/adminReviewQueue/AdminReviewQueue.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminReviewTable } from './AdminReviewTable';
import { DataTablePagination } from '@/shared/DataTablePagination';
import {
  HumanReviewNote,
  // ReviewerOverview, QueueStatus
} from '@/types/notes';
import {
  fetchHumanReviewNotes,
  // fetchReviewerOverview, fetchQueueStatus
} from './adminReviewApiCalls';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
// import { ReviewerOverviewCard } from './ReviewerOverviewCard';
// import { QueueStatusCard } from './QueueStatusCard';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AdminReviewColorKey } from './AdminReviewColorKey';
import { FiltersSection } from './FiltersSection';
import { useFilterPersistence } from '@/hooks/useFilterPersistence';
import { DEFAULT_ITEMS_PER_PAGE } from '@/constants/common';

const AdminReviewQueue = () => {
  const [notes, setNotes] = useState<HumanReviewNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  // const [overviewLoading, setOverviewLoading] = useState(true);
  // const [queueStatusLoading, setQueueStatusLoading] = useState(true);
  // const [reviewerOverview, setReviewerOverview] = useState<ReviewerOverview | null>(null);
  // const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = DEFAULT_ITEMS_PER_PAGE; // Fixed at global default

  // Filter states with persistence
  const defaultFilters = { status: 'all', priority: 'all', reviewer: 'all', search: '' };
  const [filters, setFilters, clearPersistedFilters] = useFilterPersistence('adminReviewQueueFilters', defaultFilters);

  const navigate = useNavigate();

  // Build filter payload
  const buildFilterPayload = () => {
    const filterArray: any[] = [];

    // Review Status filter
    if (filters.status && filters.status !== 'all') {
      filterArray.push({ columnName: 'ai_status', type: 'exact', value: parseInt(filters.status) });
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      filterArray.push({ columnName: 'priority', type: 'exact', value: parseInt(filters.priority) });
    }

    // Reviewer filter
    if (filters.reviewer && filters.reviewer !== 'all') {
      filterArray.push({ columnName: 'practitioner_id', type: 'exact', value: parseInt(filters.reviewer) });
    }

    // Search filter
    if (filters.search) {
      filterArray.push({ columnName: 'search', type: 'like', value: filters.search });
    }

    return { page: currentPage, pageSize: itemsPerPage, filters: filterArray };
  };

  // // Load initial data
  // useEffect(() => {
  //   // Fetch reviewer overview
  //   const loadReviewerOverview = async () => {
  //     try {
  //       // setOverviewLoading(true);
  //       const overviewData = await fetchReviewerOverview();
  //       setReviewerOverview(overviewData);
  //     } catch (error) {
  //       console.error('Error loading reviewer overview:', error);
  //     } finally {
  //       // setOverviewLoading(false);
  //     }
  //   };

  //   // Fetch queue status
  //   const loadQueueStatus = async () => {
  //     try {
  //       // setQueueStatusLoading(true);
  //       const queueStatusData = await fetchQueueStatus();
  //       setQueueStatus(queueStatusData);
  //     } catch (error) {
  //       console.error('Error loading queue status:', error);
  //     } finally {
  //       // setQueueStatusLoading(false);
  //     }
  //   };

  //   // Run non-note fetches in parallel
  //   loadReviewerOverview();
  //   loadQueueStatus();
  // }, []);

  // Load notes - apply saved filters if they exist
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setNotesLoading(true);
        setCurrentPage(1);

        // Check if filters are active (not all defaults)
        const hasActive = filters.status !== 'all' || filters.priority !== 'all' || filters.reviewer !== 'all' || filters.search !== '';

        let payload;
        if (hasActive) {
          // Build filter payload
          const filterArray: any[] = [];

          if (filters.status && filters.status !== 'all') {
            filterArray.push({ columnName: 'review_status', type: 'exact', value: parseInt(filters.status) });
          }
          if (filters.priority && filters.priority !== 'all') {
            filterArray.push({ columnName: 'priority', type: 'exact', value: parseInt(filters.priority) });
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

        const notesResponse = await fetchHumanReviewNotes(payload);
        setNotes(notesResponse.data);
        setTotalItems(notesResponse.totalCount || 0);
      } catch (error) {
        console.error('Error loading human review notes:', error);
      } finally {
        setNotesLoading(false);
      }
    };

    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Handle filter changes (updates local state only)
  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  // Apply filters
  const handleApplyFilters = async () => {
    try {
      setNotesLoading(true);
      setCurrentPage(1);

      const payload = buildFilterPayload();
      const response = await fetchHumanReviewNotes(payload);

      setNotes(response.data);
      setTotalItems(response.totalCount || 0);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  // Clear filters
  const handleClearFilters = async () => {
    clearPersistedFilters();
    setCurrentPage(1);

    try {
      setNotesLoading(true);
      const payload = { page: 1, pageSize: itemsPerPage, filters: [] };
      const response = await fetchHumanReviewNotes(payload);
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
      payload.page = page;

      const response = await fetchHumanReviewNotes(payload);
      setNotes(response.data);
      setTotalItems(response.totalCount || 0);
    } catch (error) {
      console.error('Error changing page:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleReviewNote = (noteId: string) => {
    navigate(`/admin-review-queue/single-note-audit/${noteId}`, {
      state: { from: 'admin-review-queue', chatId: notes.find(note => note.id === noteId)?.chatId },
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Column: Table with Filters */}
      <div className="space-y-6 lg:col-span-12">
        <Card className="p-6">
          {/* Filters Section */}
          <FiltersSection
            filters={filters}
            loading={notesLoading}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        </Card>
        <Card>
          {/* Pending Human Reviews Section */}
          <div>
            <div className="mb-4 flex items-center justify-between px-6">
              <div>
                <h3 className="text-primary text-lg font-semibold">Pending Admin Reviews</h3>
                <p className="text-muted-foreground text-sm">{notes.length} notes requiring review</p>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="lg" className="hover:border-green-300 hover:bg-green-50">
                    <Info />
                    Color Key
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 shadow-lg lg:w-xl" align="end" side="bottom" avoidCollisions={false}>
                  <AdminReviewColorKey />
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
                <AdminReviewTable notes={notes} onReviewNote={handleReviewNote} />

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
      </div>

      {/* Right Column: Overview Cards */}
      {/* <div className="space-y-6 lg:col-span-3">
        <ReviewerOverviewCard data={reviewerOverview} loading={overviewLoading} />
        <QueueStatusCard data={queueStatus} loading={queueStatusLoading} />
      </div> */}
    </div>
  );
};

export default AdminReviewQueue;
