import { useEffect, useState } from 'react';

/**
 * Persist pagination state (current page / page size) in localStorage.
 */
export function usePaginationPersistence<T extends Record<string, any>>(
  storageKey: string,
  defaultPagination: T,
): [T, (pagination: T) => void, () => void] {
  const [pagination, setPaginationState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultPagination, ...parsed };
      }
    } catch (error) {
      console.error(`Error loading pagination from localStorage for key "${storageKey}":`, error);
    }

    return defaultPagination;
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(pagination));
    } catch (error) {
      console.error(`Error saving pagination to localStorage for key "${storageKey}":`, error);
    }
  }, [pagination, storageKey]);

  const setPagination = (nextPagination: T) => {
    setPaginationState(nextPagination);
  };

  const clearPagination = () => {
    setPaginationState(defaultPagination);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`Error clearing pagination from localStorage for key "${storageKey}":`, error);
    }
  };

  return [pagination, setPagination, clearPagination];
}
