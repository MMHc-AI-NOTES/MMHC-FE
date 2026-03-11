import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTablePagination } from '@/shared/DataTablePagination';
import { ClientsTable } from './ClientsTable';
import { FiltersSection } from './FiltersSection';
import { fetchClients, type Client, type ClientsPayload } from './clientsApiCalls';
import { useAppDispatch } from '@/store/store';
import { setSelectedClientId } from '@/store/slices/selectedClientSlice';
import { DEFAULT_ITEMS_PER_PAGE } from '@/constants/common';

const itemsPerPage = DEFAULT_ITEMS_PER_PAGE;

const buildPayload = (page: number, search: string, sorts: ClientsPayload['sorts']): ClientsPayload => {
  const filters: ClientsPayload['filters'] = [];

  if (search.trim()) {
    filters.push({
      columnName: 'search',
      type: 'like',
      value: search.trim(),
    });
  }

  return {
    page,
    pageSize: itemsPerPage,
    filters,
    sorts,
  };
};

const Clients = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Sorting state: default unsorted (backend default)
  const [sorts, setSorts] = useState<ClientsPayload['sorts']>([]);

  useEffect(() => {
    const initialLoad = async () => {
      try {
        setLoading(true);
        const payload = buildPayload(1, '', sorts);
        const response = await fetchClients(payload);

        setClients(response.data);
        setTotalItems(response.totalCount);
        setCurrentPage(response.page);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setLoading(false);
      }
    };

    initialLoad();
    // We only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadClients = async (page: number, searchValue: string, nextSorts: ClientsPayload['sorts'] = sorts) => {
    try {
      setLoading(true);
      const payload = buildPayload(page, searchValue, nextSorts);
      const response = await fetchClients(payload);

      setClients(response.data);
      setTotalItems(response.totalCount);
      setCurrentPage(response.page);
    } catch (error) {
      // Errors are already handled in fetchClients
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setSearch(key === 'search' ? value : search);
  };

  const handleApplyFilters = async () => {
    await loadClients(1, search);
  };

  const handleClearFilters = async () => {
    setSearch('');
    await loadClients(1, '');
  };

  const handlePageChange = async (page: number) => {
    await loadClients(page, search);
  };

  // Handle sorting for Client and Notes Count columns
  const handleSortChange = async (columnName: 'client_id' | 'note_count') => {
    // 3-state cycle: unsorted -> desc -> asc -> unsorted
    const existing = sorts?.find(sort => sort.columnName === columnName);

    let nextSorts: ClientsPayload['sorts'] = [];

    if (!existing) {
      nextSorts = [{ columnName, orderBy: 'desc' }];
    } else if (existing.orderBy === 'desc') {
      nextSorts = [{ columnName, orderBy: 'asc' }];
    } else {
      nextSorts = [];
    }

    setSorts(nextSorts);
    await loadClients(1, search, nextSorts);
  };

  const handleViewClientNotes = (client: Client) => {
    // Use clientId for filtering in Notes Queue (matches client identifier in notes search)
    dispatch(setSelectedClientId(client.clientId));
    navigate('/notes-queue');
  };

  const handleNoteClick = (noteId: string) => {
    navigate(`/notes-queue/single-note-audit/${noteId}`, { state: { from: 'clients' } });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-12">
          <Card className="p-6">
            <FiltersSection
              filters={{ search }}
              loading={loading}
              onFilterChange={handleFilterChange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
          </Card>

          <Card>
            <div className="py-4">
              <div className="mb-4 px-6">
                <h3 className="text-primary text-lg font-semibold">Clients</h3>
                <p className="text-muted-foreground text-sm">
                  {totalItems > 0 ? `${totalItems} clients found` : 'Browse clients and jump directly to their notes'}
                </p>
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
                  <ClientsTable
                    clients={clients}
                    page={currentPage}
                    pageSize={itemsPerPage}
                    onViewClientNotes={handleViewClientNotes}
                    onNoteClick={handleNoteClick}
                    sorts={sorts}
                    onSortChange={handleSortChange}
                  />

                  {clients.length > 0 && (
                    <div className="mt-6 mr-4">
                      <DataTablePagination
                        currentPage={currentPage}
                        totalPages={Math.max(1, Math.ceil(totalItems / itemsPerPage))}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={() => {}}
                        itemsPerPageOptions={[itemsPerPage]}
                        showFirstLastButtons={true}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Clients;
