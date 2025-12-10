// @/pages/humanReviewQueue/HumanReviewQueue.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HumanReviewTable } from './HumanReviewTable';
import { HumanReviewFiltersSection } from './HumanReviewFiltersSection';
import { DataTablePagination } from '@/shared/DataTablePagination';
import { HumanReviewNote, ReviewerOverview, QueueStatus } from '@/types/notes';
import { fetchHumanReviewNotes, fetchReviewerOverview, fetchQueueStatus, fetchReviewers } from './humanReviewApiCalls';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewerOverviewCard } from './ReviewerOverviewCard';
import { QueueStatusCard } from './QueueStatusCard';
import { useAppSelector } from '@/store/store';
import { setReviewers } from '@/store/slices/filterOptionsSlice';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HumanReviewColorKey } from './HumanReviewColorKey';

const HumanReviewQueue = () => {
  const [notes, setNotes] = useState<HumanReviewNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [queueStatusLoading, setQueueStatusLoading] = useState(true);
  const [reviewerOverview, setReviewerOverview] = useState<ReviewerOverview | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);

  // Get filter options from Redux
  const dispatch = useDispatch();
  const { reviewers, reviewersLoaded } = useAppSelector(state => state.filterOptions);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20; // Fixed at 20 as per requirement

  // Filter states
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', reviewer: 'all', search: '' });

  const navigate = useNavigate();

  // Load initial data
  useEffect(() => {
    // Initial payload for notes
    const initialPayload = { page: 1, pageSize: itemsPerPage, filters: [] };

    // Fetch human review notes
    const loadNotes = async () => {
      try {
        setNotesLoading(true);
        const notesResponse = await fetchHumanReviewNotes(initialPayload);
        setNotes(notesResponse.data);
        setTotalItems(notesResponse.totalCount || 0);
      } catch (error) {
        console.error('Error loading human review notes:', error);
      } finally {
        setNotesLoading(false);
      }
    };

    // Fetch reviewer overview
    const loadReviewerOverview = async () => {
      try {
        setOverviewLoading(true);
        const overviewData = await fetchReviewerOverview();
        setReviewerOverview(overviewData);
      } catch (error) {
        console.error('Error loading reviewer overview:', error);
      } finally {
        setOverviewLoading(false);
      }
    };

    // Fetch queue status
    const loadQueueStatus = async () => {
      try {
        setQueueStatusLoading(true);
        const queueStatusData = await fetchQueueStatus();
        setQueueStatus(queueStatusData);
      } catch (error) {
        console.error('Error loading queue status:', error);
      } finally {
        setQueueStatusLoading(false);
      }
    };

    // Fetch reviewers only if not already loaded in Redux
    const loadReviewers = async () => {
      if (reviewersLoaded) return;
      try {
        const reviewersData = await fetchReviewers();
        dispatch(setReviewers(reviewersData));
      } catch (error) {
        console.error('Error loading reviewers:', error);
      }
    };

    // Run all fetches in parallel
    loadNotes();
    loadReviewerOverview();
    loadQueueStatus();
    loadReviewers();
  }, [reviewersLoaded, dispatch]);

  // Handle filter changes (updates local state only)
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Build filter payload
  const buildFilterPayload = () => {
    const filterArray: any[] = [];

    // Review Status filter
    if (filters.status && filters.status !== 'all') {
      filterArray.push({ columnName: 'review_status', type: 'exact', value: parseInt(filters.status) });
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      filterArray.push({ columnName: 'priority', type: 'exact', value: parseInt(filters.priority) });
    }

    // Reviewer filter
    if (filters.reviewer && filters.reviewer !== 'all') {
      filterArray.push({ columnName: 'reviewer_id', type: 'exact', value: parseInt(filters.reviewer) });
    }

    // Search filter
    if (filters.search) {
      filterArray.push({ columnName: 'search', type: 'like', value: filters.search });
    }

    return { page: currentPage, pageSize: itemsPerPage, filters: filterArray };
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
    const clearedFilters = { status: 'all', priority: 'all', reviewer: 'all', search: '' };

    setFilters(clearedFilters);
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
    navigate(`/human-review-queue/single-note-audit/${noteId}`);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Column: Table with Filters */}
      <div className="space-y-6 lg:col-span-9">
        <Card className="p-6">
          {/* Filters Section */}
          <HumanReviewFiltersSection
            filters={filters}
            reviewers={reviewers}
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
                <h3 className="text-primary text-lg font-semibold">Pending Human Reviews</h3>
                <p className="text-muted-foreground text-sm">{notes.length} notes requiring review</p>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="lg" className="hover:border-green-300 hover:bg-green-50">
                    <Info />
                    Color Key
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 shadow-lg lg:w-xl" align="end">
                  <HumanReviewColorKey />
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
                <HumanReviewTable notes={notes} onReviewNote={handleReviewNote} />

                {/* Pagination */}
                {notes.length > 0 && (
                  <div className="mt-6">
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
      <div className="space-y-6 lg:col-span-3">
        <ReviewerOverviewCard data={reviewerOverview} loading={overviewLoading} />
        <QueueStatusCard data={queueStatus} loading={queueStatusLoading} />
      </div>
    </div>
  );
};

export default HumanReviewQueue;
