// @/pages/aiLogs/AILogs.tsx
import { useState, useEffect } from 'react';
import { AILogsTable } from './AILogsTable';
import { FiltersSection } from './FiltersSection';
import { DataTablePagination } from '@/shared/DataTablePagination';
import { AILog } from '@/types/aiLogs';
import { fetchAILogs } from './aiLogsApiCalls';
import { fetchAgents } from '../settings/settingsApiCalls';
import { Agent } from '@/types/agent';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import LogDetailsSection from './LogDetailsSection';
import { FileText } from 'lucide-react';

const AILogs = () => {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AILog | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // Filter states
  const [filters, setFilters] = useState({ model: 'all', prompt: 'all', result: 'all', severity: 'all' });

  // Build filter payload for API
  const buildFilterPayload = () => {
    const filterArray: any[] = [];

    // Model filter
    if (filters.model && filters.model !== 'all') {
      filterArray.push({ columnName: 'model_id', type: 'like', value: filters.model });
    }

    // Prompt filter (agent ID)
    if (filters.prompt && filters.prompt !== 'all') {
      filterArray.push({ columnName: 'agent_id', type: 'exact', value: parseInt(filters.prompt) });
    }

    // Result filter (based on evaluation score)
    if (filters.result && filters.result !== 'all') {
      filterArray.push({ columnName: 'result', type: 'exact', value: parseInt(filters.result) });
    }

    // Severity filter
    if (filters.severity && filters.severity !== 'all') {
      filterArray.push({ columnName: 'severity', type: 'exact', value: parseInt(filters.severity) });
    }

    return { page: currentPage, pageSize: itemsPerPage, filters: filterArray };
  };

  // Load initial data
  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const response = await fetchAILogs({ page: 1, pageSize: itemsPerPage, filters: [] });
        setLogs(response.data);
        setTotalItems(response.totalCount || 0);
      } catch (error) {
        console.error('Error loading logs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  // Load agents for prompt options
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const agentsData = await fetchAgents();
        setAgents(agentsData);
      } catch (error) {
        console.error('Error loading agents:', error);
      }
    };

    loadAgents();
  }, []);

  // Handle filter changes (updates local state only)
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters - makes API call with current filter values
  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      setCurrentPage(1);
      setSelectedLog(null);

      const payload = buildFilterPayload();
      payload.page = 1; // Reset to first page
      const response = await fetchAILogs(payload);

      setLogs(response.data);
      setTotalItems(response.totalCount || 0);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear filters - resets all filters and fetches unfiltered data
  const handleClearFilters = async () => {
    const clearedFilters = { model: 'all', prompt: 'all', result: 'all', severity: 'all' };

    setFilters(clearedFilters);
    setCurrentPage(1);
    setSelectedLog(null);

    try {
      setLoading(true);
      const payload = { page: 1, pageSize: itemsPerPage, filters: [] };
      const response = await fetchAILogs(payload);
      setLogs(response.data);
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
    setSelectedLog(null);

    try {
      setLoading(true);
      const payload = buildFilterPayload();
      payload.page = page;

      const response = await fetchAILogs(payload);
      setLogs(response.data);
      setTotalItems(response.totalCount || 0);
    } catch (error) {
      console.error('Error changing page:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle log selection
  const handleSelectLog = (log: AILog) => {
    setSelectedLog(prev => (prev?.id === log.id ? null : log));
  };

  // Handle re-run audit
  const handleReRunAudit = (samePrompt: boolean, agentId?: number) => {
    console.log('Re-running audit with', samePrompt ? 'same' : 'latest', 'prompt', agentId ? `using agent ${agentId}` : '');
    // Implement re-run logic here
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <FiltersSection
          filters={filters}
          agents={agents}
          loading={loading}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Table */}
        <div className="px-4">
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
              <AILogsTable logs={logs} selectedLogId={selectedLog?.id || null} onSelectLog={handleSelectLog} />

              {/* Pagination */}
              {logs.length > 0 && (
                <div className="mt-6">
                  <DataTablePagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalItems / itemsPerPage)}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={() => {}}
                    itemName="log"
                    itemNamePlural="logs"
                    itemsPerPageOptions={[20]}
                    showFirstLastButtons={true}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Log Details Section */}
      {selectedLog ? (
        <LogDetailsSection log={selectedLog} agents={agents} onReRunAudit={handleReRunAudit} />
      ) : (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="mb-2 h-16 w-16 text-gray-300" />

            <p className="text-primary mb-2 text-xl font-semibold">No Log Selected</p>
            <p className="text-sm text-gray-500">
              Select a log entry from the table above to view detailed information,
              <br />
              prompts, and outputs.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AILogs;
