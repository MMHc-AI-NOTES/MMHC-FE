import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, ArrowDownUp, ArrowUp, ArrowDown } from 'lucide-react';
import type { Client, ClientsPayload } from './clientsApiCalls';

interface ClientsTableProps {
  clients: Client[];
  page: number;
  pageSize: number;
  onViewClientNotes: (client: Client) => void;
  onNoteClick: (noteId: string) => void;
  sorts?: ClientsPayload['sorts'];
  onSortChange?: (columnName: 'client_id' | 'note_count') => void;
}

const getSortIcon = (columnName: 'client_id' | 'note_count', sorts?: ClientsPayload['sorts']) => {
  const activeSort = sorts?.find(sort => sort?.columnName === columnName);

  if (!activeSort) {
    return <ArrowDownUp className="text-muted-foreground h-3.5 w-3.5" />;
  }

  if (activeSort.orderBy === 'asc') {
    return <ArrowUp className="h-3.5 w-3.5" />;
  }

  return <ArrowDown className="h-3.5 w-3.5" />;
};

export const ClientsTable = ({ clients, page, pageSize, onViewClientNotes, onNoteClick, sorts, onSortChange }: ClientsTableProps) => {
  const columnCount = 4;

  if (!clients.length) {
    return (
      <div className="border-y">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-primary pl-4 text-left font-semibold">No</TableHead>
                <TableHead className="text-primary min-w-[160px] font-semibold">
                  <button
                    type="button"
                    className="flex w-full items-center justify-start gap-1"
                    onClick={() => onSortChange?.('client_id')}
                  >
                    <span>Client</span>
                    {getSortIcon('client_id', sorts)}
                  </button>
                </TableHead>
                <TableHead className="text-primary min-w-[140px] font-semibold">
                  <button
                    type="button"
                    className="flex w-full items-center justify-start gap-1"
                    onClick={() => onSortChange?.('note_count')}
                  >
                    <span>Notes Count</span>
                    {getSortIcon('note_count', sorts)}
                  </button>
                </TableHead>
                <TableHead className="text-primary text-center font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={columnCount} className="text-muted-foreground py-8 text-center">
                  No clients found matching your search.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="border-y">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-primary pl-4 text-left font-semibold">No</TableHead>
              <TableHead className="text-primary min-w-[160px] pl-8 text-left font-semibold">
                <button type="button" className="flex w-full items-center gap-1" onClick={() => onSortChange?.('client_id')}>
                  <span>Client</span>
                  {getSortIcon('client_id', sorts)}
                </button>
              </TableHead>
              <TableHead className="text-primary min-w-[140px] font-semibold">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-1"
                  onClick={() => onSortChange?.('note_count')}
                >
                  <span>Notes Count</span>
                  {getSortIcon('note_count', sorts)}
                </button>
              </TableHead>
              <TableHead className="text-primary text-center font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client, index) => (
              <TableRow key={client.id} className="align-top">
                <TableCell className="text-left font-medium">{(page - 1) * pageSize + index + 1}</TableCell>
                <TableCell className="w-sm align-top font-medium">
                  <Collapsible className="group">
                    <div className="flex items-start gap-2">
                      <CollapsibleTrigger asChild>
                        <button type="button">
                          <ChevronRight className="mt-1 h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                        </button>
                      </CollapsibleTrigger>
                      <span className="pt-1">{client.clientId}</span>
                    </div>
                    <CollapsibleContent>
                      <div className="mt-1">
                        {client.sessions.length ? (
                          <ul className="text-muted-foreground space-y-1.5 text-xs">
                            {client.sessions.map((session, sIndex) => (
                              <li key={session.id} className="flex items-center gap-2">
                                <span className="text-muted-foreground text-[10px]">{sIndex + 1}.</span>
                                <button
                                  type="button"
                                  onClick={() => onNoteClick(session.noteId)}
                                  className="text-primary focus-visible:ring-primary/60 font-mono text-[11px] hover:underline focus:outline-none focus-visible:ring-2"
                                >
                                  Note ID: {session.noteId}
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground text-xs">No sessions found for this client.</p>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </TableCell>
                <TableCell>{client.notesCount}</TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary bg-transparent text-[13px] hover:text-white"
                    onClick={() => onViewClientNotes(client)}
                  >
                    View Notes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
