// @/pages/notesQueue/NotesQueue.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTableFilter, DataTableFilters } from '@/shared/DataTableFilters';
import { DataTablePagination } from '@/shared/DataTablePagination';
import { DataTableSkeleton } from '@/shared/DataTableSkeleton';
import { NotesTable } from './NotesTable';
import { FormattedNote } from '@/types/notes';
import { fetchNotes } from './notesApiCalls';
import { Card } from '@/components/ui/card';

const NotesQueue = () => {
  const [notes, setNotes] = useState<FormattedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string | string[]>>({
    practitioner: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  // Dynamically generate practitioner filter options from notes
  const practitionerFilterOptions = useMemo(() => {
    const uniquePractitioners = Array.from(new Set(notes.map(note => note.practitioner)))
      .filter(Boolean)
      .sort();

    return uniquePractitioners.map(practitioner => ({
      value: practitioner,
      label: practitioner,
    }));
  }, [notes]);

  // Define filters array
  const notesFilterOptions = useMemo(
    (): DataTableFilter[] => [
      {
        id: 'practitioner',
        label: 'Practitioner',
        options: practitionerFilterOptions,
      },
    ],
    [practitionerFilterOptions],
  );

  // Load notes
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true);
        const formattedNotes = await fetchNotes();
        setNotes(formattedNotes);
      } catch (error) {
        console.error('Error loading notes:', error);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  // Handle filter changes
  const handleFilterChange = (filterId: string, value: string | string[]) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterId]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Filter notes based on search and selected filters
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      // Search filter
      const matchesSearch =
        note.id.toLowerCase().includes(searchTerm.toLowerCase()) || note.practitioner.toLowerCase().includes(searchTerm.toLowerCase());

      // Practitioner filter
      const practitionerFilter = selectedFilters.practitioner as string;
      const matchesPractitioner = !practitionerFilter || note.practitioner === practitionerFilter;

      return matchesSearch && matchesPractitioner;
    });
  }, [notes, searchTerm, selectedFilters.practitioner]);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotes = filteredNotes.slice(startIndex, startIndex + itemsPerPage);

  // Ensure current page is valid when data changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleViewNote = (noteId: string) => {
    navigate(`/notes-queue/single-note-audit/${noteId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <>
      <Card className="p-6">
        {loading ? (
          <DataTableSkeleton
            columnCount={4}
            rowCount={5}
            columnWidths={['w-[120px]', 'w-[200px]', 'w-[180px]', 'w-[100px]']}
            showFilters={true}
            showSearch={true}
            filterCount={1}
          />
        ) : (
          <>
            <DataTableFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search by note ID, practitioner..."
              filters={notesFilterOptions}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              showSearch={true}
            />

            <NotesTable notes={paginatedNotes} onViewNote={handleViewNote} />

            {filteredNotes.length > 0 && (
              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredNotes.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemName="note"
                itemNamePlural="notes"
                itemsPerPageOptions={[5, 10, 25, 50]}
                showFirstLastButtons={true}
              />
            )}
          </>
        )}
      </Card>
    </>
  );
};

export default NotesQueue;
