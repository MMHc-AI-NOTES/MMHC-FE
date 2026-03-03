import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { History, X } from 'lucide-react';
import { WebhookVersion } from '@/types/notes';
import { cn } from '@/lib/utils';

interface VersionHistoryPopoverProps {
  versions: WebhookVersion[];
  selectedVersionIndex: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onVersionSelect: (versionId: number) => void;
  formatDate: (dateString: string) => string;
}

export function VersionHistoryPopover({
  versions,
  selectedVersionIndex,
  isOpen,
  onOpenChange,
  onVersionSelect,
  formatDate,
}: VersionHistoryPopoverProps) {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-primary flex items-center gap-2 border">
          <History />
          History
        </Button>
      </PopoverTrigger>
      <PopoverContent className="h-[350px] w-[250px] border-0 p-0" align="end">
        <div>
          <div className="flex items-center justify-between py-2 pl-4">
            <h3 className="text-primary font-semibold">Version History</h3>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X />
            </Button>
          </div>
          <Separator className="mb-4" />
          <div className="h-[270px] space-y-0 overflow-y-auto px-2 pb-2">
            {versions.map((version, index) => {
              const isCurrent = index === selectedVersionIndex;
              const isCurrentVersion = index === 0;
              const versionNumber = versions.length - index;
              return (
                <div key={version.id}>
                  <div
                    onClick={() => onVersionSelect(version.id)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors',
                      isCurrent && 'border',
                    )}
                    style={{
                      backgroundColor: isCurrent ? 'rgba(161, 230, 129, 0.1)' : 'transparent',
                      borderColor: isCurrent ? 'rgba(161, 230, 129, 0.4)' : 'transparent',
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-primary font-semibold">{`Version ${versionNumber}`}</p>
                      <p className="text-sm text-gray-600">{formatDate(version.createdAt)}</p>
                    </div>
                    {isCurrentVersion && (
                      <Badge className="bg-gradient-light text-primary rounded-sm px-2 py-1 text-xs font-semibold">Current</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
