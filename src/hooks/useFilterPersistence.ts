import { useState, useEffect } from 'react';

/**
 * Custom hook to persist filter state to localStorage
 * @param storageKey - Unique key for localStorage (e.g., 'notesQueueFilters')
 * @param defaultFilters - Default filter values when no saved filters exist
 * @returns [filters, setFilters, clearFilters] - Filter state and handlers
 */
export function useFilterPersistence<T extends Record<string, any>>(
  storageKey: string,
  defaultFilters: T,
): [T, (filters: T) => void, () => void] {
  // Initialize state from localStorage or use defaults
  const [filters, setFiltersState] = useState<T>(() => {
    try {
      const savedFilters = localStorage.getItem(storageKey);
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        // Merge with defaults to handle any new filter fields
        return { ...defaultFilters, ...parsed };
      }
    } catch (error) {
      console.error(`Error loading filters from localStorage for key "${storageKey}":`, error);
    }
    return defaultFilters;
  });

  // Save to localStorage whenever filters change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(filters));
    } catch (error) {
      console.error(`Error saving filters to localStorage for key "${storageKey}":`, error);
    }
  }, [filters, storageKey]);

  // Set filters (updates both state and localStorage)
  const setFilters = (newFilters: T) => {
    setFiltersState(newFilters);
  };

  // Clear filters (resets to defaults and removes from localStorage)
  const clearFilters = () => {
    setFiltersState(defaultFilters);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`Error clearing filters from localStorage for key "${storageKey}":`, error);
    }
  };

  return [filters, setFilters, clearFilters];
}
