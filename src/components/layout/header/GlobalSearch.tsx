import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, FileText, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { fetchNotes } from '@/pages/notesQueue/notesApiCalls';
import { FormattedNote } from '@/types/notes';
import { cn } from '@/lib/utils';

const GlobalSearch = () => {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [results, setResults] = useState<FormattedNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search text - wait 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch results when debounced search changes
  useEffect(() => {
    const searchNotes = async () => {
      if (!debouncedSearch.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const payload = {
          page: 1,
          pageSize: 10, // Limit to 10 results for dropdown
          filters: [{ columnName: 'search', type: 'like' as const, value: debouncedSearch }],
        };
        const response = await fetchNotes(payload);
        setResults(response.data);
        setIsOpen(true);
      } catch (error) {
        console.error('Error searching notes:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchNotes();
  }, [debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleResultClick = (event: React.MouseEvent<HTMLButtonElement>, noteId: string) => {
    const url = `/notes-queue/single-note-audit/${noteId}`;

    if (event.metaKey || event.ctrlKey || event.button === 1) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(url);
    }

    setSearchText('');
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchText('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full md:w-80" onKeyDown={handleKeyDown}>
      {/* Search Input */}
      <div className="relative">
        <Search className="text-primary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          ref={inputRef}
          placeholder="Search notes..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="w-full pr-8 pl-10"
        />
        {/* Loading or Clear button */}
        <div className="absolute top-1/2 right-3 -translate-y-1/2">
          {loading ? (
            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
          ) : searchText ? (
            <X className="h-4 w-4" onClick={handleClear} />
          ) : null}
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-80 w-full overflow-auto rounded-md border bg-white shadow-lg">
          {results.length === 0 ? (
            <div className="text-muted-foreground p-4 text-center text-sm">{loading ? 'Searching...' : 'No notes found'}</div>
          ) : (
            <ul className="py-1">
              {results.map(note => (
                <li key={note.id}>
                  <button
                    onClick={event => handleResultClick(event, note.noteId)}
                    className={cn(
                      'flex w-full items-start gap-1 px-3 py-1 text-left transition-colors',
                      'hover:bg-muted focus:bg-muted focus:outline-none',
                    )}
                  >
                    <div className="bg-primary/10 mt-0.5 flex shrink-0 items-center justify-center rounded p-1">
                      <FileText className="text-primary h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-primary text-xs font-medium">Note Id: {note.noteId}</div>
                      <div className="text-muted-foreground text-xs">Practitioner: {note.practitioner}</div>
                      <div className="text-muted-foreground text-xs">Client Id: {note.client}</div>
                      <div className="text-muted-foreground text-xs">Date: {note.date}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* View all results link */}
          {results.length > 0 && (
            <div className="border-t p-2">
              <button
                onClick={() => {
                  navigate(`/notes-queue?search=${encodeURIComponent(searchText)}`);
                  setSearchText('');
                  setIsOpen(false);
                }}
                className="text-primary hover:text-primary/80 w-full text-center text-sm font-medium"
              >
                View all results
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
