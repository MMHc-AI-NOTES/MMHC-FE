import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SelectedNoteSummaryCardProps {
  selectedCount: number;
  onReRunAudit: () => void;
  onAssignReviewer: () => void;
  onClearFromBlocklist: () => void;
}

export const SelectedNoteSummaryCard = ({
  selectedCount,
  onReRunAudit,
  onAssignReviewer,
  onClearFromBlocklist,
}: SelectedNoteSummaryCardProps) => {
  return (
    <Card className="mb-4 py-4">
      <CardContent className="flex items-center justify-between px-4">
        <div className="text-primary flex items-center gap-2 font-semibold">
          <p>{selectedCount}</p>
          <p>Notes Selected</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={onReRunAudit} size="lg" className="bg-gradient-light text-primary h-11 text-[16px] font-semibold">
            Re-Run AI Audit
          </Button>
          <Button
            onClick={onAssignReviewer}
            size="lg"
            variant="outline"
            className="text-primary border-primary h-11 border-2 text-[16px] font-semibold"
          >
            Assign Reviewer
          </Button>
          <Button
            onClick={onClearFromBlocklist}
            size="lg"
            variant="outline"
            className="h-11 border-2 border-red-700 text-[16px] font-semibold text-red-700"
          >
            Clear from Blocklist
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
