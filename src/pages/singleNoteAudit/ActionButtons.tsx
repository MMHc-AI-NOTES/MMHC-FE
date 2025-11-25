import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Send, Flag } from 'lucide-react';

interface ActionButtonsProps {
  onFlagReview: () => void;
}

const ActionButtons = ({ onFlagReview }: ActionButtonsProps) => {
  return (
    <Card className="space-y-2 p-2">
      <Button className="to-primary-light text-primary h-12 w-full border-0 bg-gradient-to-r from-gray-50 shadow-sm">
        <RefreshCcw className="mr-2" />
        Re-Run Audit
      </Button>
      <Button variant="outline" className="border-primary text-primary h-12 w-full border-2">
        <Send className="mr-2" />
        Send to Practitioner
      </Button>
      <Button variant="ghost" className="h-12 w-full" onClick={onFlagReview}>
        <Flag className="mr-2" />
        Flag for Manager Review
      </Button>
    </Card>
  );
};

export default ActionButtons;
