import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Stethoscope, ChevronLeft, ChevronRight, ScrollText, PencilLine, History, X } from 'lucide-react';
import { WebhookVersion } from '@/types/notes';
import moment from 'moment';
import { SessionJsonFieldDisplayNames } from '@/constants/common';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface TherapySessionSummaryCardProps {
  webhookVersions: WebhookVersion[];
  onVersionChange?: (versionId: number) => void;
}

const TherapySessionSummaryCard = ({ webhookVersions, onVersionChange }: TherapySessionSummaryCardProps) => {
  // Sort versions by id descending (newest first)
  const sortedVersions = useMemo(() => {
    return [...webhookVersions].sort((a, b) => b.id - a.id);
  }, [webhookVersions]);

  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  // Initialize with latest version on mount
  useEffect(() => {
    if (sortedVersions.length > 0 && onVersionChange) {
      onVersionChange(sortedVersions[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const currentVersion = sortedVersions[selectedVersionIndex];
  const previousVersion = selectedVersionIndex < sortedVersions.length - 1 ? sortedVersions[selectedVersionIndex + 1] : null;
  const isHistoricalVersion = selectedVersionIndex > 0;
  const isFirstVersion = selectedVersionIndex === sortedVersions.length - 1;
  const isLastVersion = selectedVersionIndex === 0;

  // Parse sessionJson
  const currentSessionData = useMemo(() => {
    if (!currentVersion?.sessionJson) return {};
    try {
      return JSON.parse(currentVersion.sessionJson);
    } catch {
      return {};
    }
  }, [currentVersion]);

  const previousSessionData = useMemo(() => {
    if (!previousVersion?.sessionJson) return {};
    try {
      return JSON.parse(previousVersion.sessionJson);
    } catch {
      return {};
    }
  }, [previousVersion]);

  // Compare versions and find changed fields
  const changedFields = useMemo(() => {
    if (!previousVersion) return [];
    const changes: Array<{ key: string; previous: string; current: string }> = [];

    Object.keys(currentSessionData).forEach(key => {
      const currentValue = String(currentSessionData[key] || '').trim();
      const previousValue = String(previousSessionData[key] || '').trim();

      if (currentValue !== previousValue) {
        changes.push({
          key,
          previous: previousValue || '-',
          current: currentValue || '-',
        });
      }
    });

    return changes;
  }, [currentSessionData, previousSessionData, previousVersion]);

  const handleVersionSelect = (versionId: number) => {
    const index = sortedVersions.findIndex(v => v.id === versionId);
    if (index !== -1) {
      setSelectedVersionIndex(index);
      // setIsVersionHistoryOpen(false);
      if (onVersionChange) {
        onVersionChange(sortedVersions[index].id);
      }
    }
  };

  const handlePrevious = () => {
    if (!isFirstVersion) {
      const newIndex = selectedVersionIndex + 1;
      setSelectedVersionIndex(newIndex);
      if (onVersionChange) {
        onVersionChange(sortedVersions[newIndex].id);
      }
    }
  };

  const handleNext = () => {
    if (!isLastVersion) {
      const newIndex = selectedVersionIndex - 1;
      setSelectedVersionIndex(newIndex);
      if (onVersionChange) {
        onVersionChange(sortedVersions[newIndex].id);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format('MMM D, YYYY');
  };

  const getFieldDisplayName = (key: string) => {
    return SessionJsonFieldDisplayNames[key] || key;
  };

  if (sortedVersions.length === 0) {
    return null;
  }

  return (
    <Card className="gap-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
            <Stethoscope />
            Therapy Session Summary
          </CardTitle>
          <Popover open={isVersionHistoryOpen} onOpenChange={setIsVersionHistoryOpen}>
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
                  <Button variant="ghost" size="icon" onClick={() => setIsVersionHistoryOpen(false)}>
                    <X />
                  </Button>
                </div>
                <Separator className="mb-4" />
                <div className="h-[270px] space-y-0 overflow-y-auto px-2 pb-2">
                  {sortedVersions.map((version, index) => {
                    const isCurrent = index === selectedVersionIndex;
                    const isCurrentVersion = index === 0;
                    const versionNumber = sortedVersions.length - index;

                    return (
                      <div key={version.id}>
                        <div
                          onClick={() => handleVersionSelect(version.id)}
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
                            <p className="text-primary font-semibold">{isCurrentVersion ? 'Current' : `Version ${versionNumber}`}</p>
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
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Banners */}
        <div className="space-y-2">
          {isHistoricalVersion && (
            <div className="bg-orange-light border-orange-dark flex w-fit items-center gap-2 rounded-md border px-5 py-2.5">
              <ScrollText className="text-orange-dark h-4 w-4" />
              <span className="text-orange-dark text-sm font-medium">Viewing Historical Version - Read Only</span>
            </div>
          )}
          {changedFields.length > 0 && previousVersion && (
            <div
              className="text-primary flex w-fit items-center gap-2 rounded-md border px-5 py-2.5"
              style={{ backgroundColor: 'rgba(161, 230, 129, 0.1)', borderColor: 'rgba(161, 230, 129, 0.4)' }}
            >
              <PencilLine className="h-4 w-4" />
              <span className="text-sm font-medium">
                {changedFields.length} field{changedFields.length !== 1 ? 's' : ''} changed from previous version
              </span>
            </div>
          )}
        </div>

        {/* Session Data */}
        <div className="rounded-lg bg-[#F0F0F0] p-4">
          <div className="space-y-3 text-sm leading-relaxed text-gray-700">
            {Object.entries(currentSessionData).map(([key, value]) => {
              const displayName = getFieldDisplayName(key);
              const displayValue = value === '' || value === null || value === undefined ? '-' : String(value);
              const isChanged = changedFields.some(field => field.key === key);
              const previousValue = isChanged ? changedFields.find(field => field.key === key)?.previous : null;

              return (
                <div key={key} className="mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-primary font-semibold">{displayName}:</h4>
                    {isChanged && <Badge className="bg-gradient-light text-primary rounded-sm text-xs font-semibold">CHANGED</Badge>}
                  </div>
                  {isChanged && previousValue && (
                    <div
                      className="mt-1 ml-4 rounded-sm border-2 p-2"
                      style={{ backgroundColor: 'rgba(161, 230, 129, 0.1)', borderColor: 'rgba(161, 230, 129, 0.4)' }}
                    >
                      <p className="text-red-dark text-xs font-semibold">PREVIOUS:</p>
                      <p className="font-light text-gray-400 line-through">{previousValue}</p>

                      <p className="text-green-dark-light mt-1 text-xs font-semibold">NEW:</p>
                      <p className="text-primary font-medium">{displayValue}</p>
                    </div>
                  )}
                  {!isChanged && <p className="ml-4 text-gray-700">{displayValue}</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with Navigation */}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2 text-sm">
            <p className="text-primary font-semibold">
              {isHistoricalVersion ? `Version ${sortedVersions.length - selectedVersionIndex}` : 'Current'}
            </p>
            -<p className="text-gray-600">{formatDate(currentVersion.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleNext} disabled={isLastVersion}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrevious} disabled={isFirstVersion}>
              <ChevronRight />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TherapySessionSummaryCard;
