// @/pages/adminReviewQueue/AdminReviewTable.tsx
import { ArrowRight, ArrowDownUp, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HumanReviewNote } from '@/types/notes';

type SortOrder = 'asc' | 'desc';

interface SortItem {
  columnName: string;
  orderBy: SortOrder;
}

interface AdminReviewTableProps {
  notes: HumanReviewNote[];
  onReviewNote: (noteId: string) => void;
  page?: number;
  pageSize?: number;
  sorts?: SortItem[];
  onSortChange?: (columnName: string) => void;
}

const getSortIcon = (columnName: string, sorts?: SortItem[]) => {
  const activeSort = sorts?.find(sort => sort.columnName === columnName);

  if (!activeSort) {
    return <ArrowDownUp className="text-muted-foreground h-3.5 w-3.5" />;
  }

  if (activeSort.orderBy === 'asc') {
    return <ArrowUp className="h-3.5 w-3.5" />;
  }

  return <ArrowDown className="h-3.5 w-3.5" />;
};

export const AdminReviewTable = ({ notes, onReviewNote, page = 1, pageSize = 20, sorts, onSortChange }: AdminReviewTableProps) => {
  const columnCount = 8;

  if (notes.length === 0) {
    return (
      <div className="border-y">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-primary min-w-[80px] font-semibold">No.</TableHead>
                <TableHead className="text-primary min-w-[140px] font-semibold">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-1"
                    onClick={() => onSortChange?.('practitioner_id')}
                  >
                    <span>PRACTITIONER</span>
                    {getSortIcon('practitioner_id', sorts)}
                  </button>
                </TableHead>
                <TableHead className="text-primary min-w-[120px] font-semibold">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-1"
                    onClick={() => onSortChange?.('created_at')}
                  >
                    <span>DATE</span>
                    {getSortIcon('created_at', sorts)}
                  </button>
                </TableHead>
                <TableHead className="text-primary min-w-[140px] text-center font-semibold">REVIEW DATE</TableHead>
                <TableHead className="text-primary min-w-[140px] text-center font-semibold">HUMAN SCORE</TableHead>
                <TableHead className="text-primary min-w-[140px] font-semibold">
                  <button type="button" className="flex w-full items-center justify-center gap-1" onClick={() => onSortChange?.('note_id')}>
                    <span>NOTE ID</span>
                    {getSortIcon('note_id', sorts)}
                  </button>
                </TableHead>
                <TableHead className="text-primary min-w-[140px] text-center font-semibold">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={columnCount} className="text-muted-foreground py-8 text-center">
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
    <div className="border-y">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-primary pl-4 text-left font-semibold">No.</TableHead>
              <TableHead className="text-primary min-w-[140px] font-semibold">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-1"
                  onClick={() => onSortChange?.('practitioner_id')}
                >
                  <span>PRACTITIONER</span>
                  {getSortIcon('practitioner_id', sorts)}
                </button>
              </TableHead>
              <TableHead className="text-primary min-w-[120px] font-semibold">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-1"
                  onClick={() => onSortChange?.('created_at')}
                >
                  <span>DATE</span>
                  {getSortIcon('created_at', sorts)}
                </button>
              </TableHead>
              <TableHead className="text-primary min-w-[140px] text-center font-semibold">REVIEW DATE</TableHead>
              <TableHead className="text-primary min-w-[140px] text-center font-semibold">HUMAN SCORE</TableHead>

              <TableHead className="text-primary min-w-[140px] font-semibold">
                <button type="button" className="flex w-full items-center justify-center gap-1" onClick={() => onSortChange?.('note_id')}>
                  <span>NOTE ID</span>
                  {getSortIcon('note_id', sorts)}
                </button>
              </TableHead>
              <TableHead className="text-primary min-w-[140px] text-center font-semibold">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note, index) => (
              <TableRow key={index} className="group">
                <TableCell className="text-left font-medium">{(page - 1) * pageSize + index + 1}</TableCell>
                <TableCell className="font-medium">{note.practitioner}</TableCell>
                <TableCell>{note.date}</TableCell>
                <TableCell>{note.reviewDate}</TableCell>
                <TableCell className="font-semibold">{note.score}</TableCell>
                <TableCell className="font-medium">{note.id}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={event => {
                        const url = `/admin-review-queue/single-note-audit/${note.id}`;
                        const params = new URLSearchParams();
                        params.set('from', 'admin-review-queue');
                        if ((note as any).chatId) {
                          params.set('chatId', String((note as any).chatId));
                        }
                        params.set('hideBack', '1');
                        const fullUrl = `${url}?${params.toString()}`;

                        if (event.metaKey || event.ctrlKey || event.button === 1) {
                          window.open(fullUrl, '_blank', 'noopener,noreferrer');
                        } else {
                          onReviewNote(note.id);
                        }
                      }}
                      className="border-primary text-primary hover:bg-primary h-9 gap-1 bg-transparent text-[13px] hover:text-white"
                    >
                      Review Note
                      <ArrowRight className="ml-1" />
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
