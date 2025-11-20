// @/components/notes/NotesTable.tsx
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FormattedNote } from '@/types/notes';

interface NotesTableProps {
  notes: FormattedNote[];
  onViewNote: (noteId: string) => void;
}

export const NotesTable = ({ notes, onViewNote }: NotesTableProps) => {
  if (notes.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Note ID</TableHead>
                <TableHead className="w-[200px]">Practitioner</TableHead>
                <TableHead className="w-[180px]">Session Time</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                  No notes found matching your filters.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px] min-w-[120px]">Note ID</TableHead>
              <TableHead className="w-[200px] min-w-[200px]">Practitioner</TableHead>
              <TableHead className="w-[180px] min-w-[180px]">Session Time</TableHead>
              <TableHead className="w-[100px] min-w-[100px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note, index) => (
              <TableRow key={index} className="group">
                {/* Note ID - Fixed width, truncate long IDs */}
                <TableCell className="w-[120px] min-w-[120px] font-medium">
                  <div className="truncate" title={note.id}>
                    {note.id}
                  </div>
                </TableCell>

                {/* Practitioner - Flexible but with min-width, wrap if needed */}
                <TableCell className="w-[200px] min-w-[200px]">
                  <div className="break-words whitespace-normal">{note.practitioner}</div>
                </TableCell>

                {/* Session Time - Fixed width, wrap if needed */}
                <TableCell className="w-[180px] min-w-[180px]">
                  <div className="text-sm break-words whitespace-normal">{note.sessionTime}</div>
                </TableCell>

                {/* Actions - Fixed width, centered */}
                <TableCell className="w-[100px] min-w-[100px]">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onViewNote(note.id)} title="View Note" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
