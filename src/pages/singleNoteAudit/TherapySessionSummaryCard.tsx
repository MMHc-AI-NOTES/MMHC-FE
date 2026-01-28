import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Stethoscope, ChevronLeft, ChevronRight, ScrollText, PencilLine, History, X, Plus, Save } from 'lucide-react';
import { WebhookVersion } from '@/types/notes';
import moment from 'moment';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useAppSelector } from '@/store/store';
import { useDispatch } from 'react-redux';
import { fetchSMETemplates, fetchIssueRelatedTo, fetchIssueDescriptions } from '@/pages/settings/settingsApiCalls';
import { setSMETemplates, setIssueRelatedTo, setIssueDescriptions } from '@/store/slices/smeConfigSlice';
import { createSMEIssueFromTemplate } from './singleNoteApiCalls';
import type { IssueForm } from './components/types';
import type { SMETemplate } from '@/pages/settings/settingsApiCalls';
import { UserRoleEnum } from '@/constants/common';

interface TherapySessionSummaryCardProps {
  webhookVersions: WebhookVersion[];
  onVersionChange?: (versionId: number) => void;
  noteId?: string;
  versionId?: number | null;
  reviewerId?: number | null;
  practitionerId?: number;
  aiStatusId?: number;
  priorityId?: number;
  onSMEIssueCreatedFromTemplate?: (response: { id: number }, issueForm: IssueForm, versionId: number) => void;
}

const TherapySessionSummaryCard = ({
  webhookVersions,
  onVersionChange,
  noteId,
  versionId,
  reviewerId,
  practitionerId = 0,
  aiStatusId = 1,
  priorityId = 1,
  onSMEIssueCreatedFromTemplate,
}: TherapySessionSummaryCardProps) => {
  const dispatch = useDispatch();
  const { issueRelatedTo, smeTemplates, issueDescriptions, errorTypes } = useAppSelector(state => state.smeConfig);
  const user = useAppSelector(state => state.auth.user);
  // State
  const [expandedFieldKey, setExpandedFieldKey] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | ''>('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  // Fetch SME config data on mount
  useEffect(() => {
    const load = async () => {
      const [templates, relatedTo, descriptions] = await Promise.all([
        fetchSMETemplates(),
        fetchIssueRelatedTo(),
        fetchIssueDescriptions(),
      ]);
      dispatch(setSMETemplates(templates));
      dispatch(setIssueRelatedTo(relatedTo));
      dispatch(setIssueDescriptions(descriptions));
    };
    load();
  }, [dispatch]);

  // Initialize with latest version on mount
  useEffect(() => {
    if (sortedVersions.length > 0 && onVersionChange) {
      onVersionChange(sortedVersions[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sort versions by id descending (newest first)
  const sortedVersions = useMemo(() => {
    return [...webhookVersions].sort((a, b) => b.id - a.id);
  }, [webhookVersions]);

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

  // Helper: Normalize field key by removing common suffixes like "(optional)"
  const normalizeFieldKey = (key: string): string => {
    if (!key) return '';
    return key.replace(/\s*\(optional\)/gi, '').trim();
  };

  // Create mapping from sessionJson keys to issueRelatedTo IDs
  const fieldKeyToIssueRelatedToIdMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!issueRelatedTo || !Array.isArray(issueRelatedTo)) return map;

    issueRelatedTo.forEach(irt => {
      if (irt.id) {
        if (irt.displayName) {
          const normalizedDisplayName = normalizeFieldKey(irt.displayName);
          map.set(irt.displayName, irt.id);
          if (normalizedDisplayName !== irt.displayName) {
            map.set(normalizedDisplayName, irt.id);
          }
        }
        if (irt.fieldId) {
          const normalizedFieldId = normalizeFieldKey(irt.fieldId);
          map.set(irt.fieldId, irt.id);
          if (normalizedFieldId !== irt.fieldId) {
            map.set(normalizedFieldId, irt.id);
          }
        }
      }
    });

    return map;
  }, [issueRelatedTo]);

  // Find issueRelatedTo ID by fieldKey
  const getIssueRelatedToId = (fieldKey: string): number | null => {
    if (!fieldKey) return null;

    const exactMatch = fieldKeyToIssueRelatedToIdMap.get(fieldKey);
    if (exactMatch) return exactMatch;

    const normalizedKey = normalizeFieldKey(fieldKey);
    const normalizedMatch = fieldKeyToIssueRelatedToIdMap.get(normalizedKey);
    if (normalizedMatch) return normalizedMatch;

    const lowerKey = normalizedKey.toLowerCase();
    for (const [mapKey, mapId] of fieldKeyToIssueRelatedToIdMap.entries()) {
      if (mapKey.toLowerCase() === lowerKey) return mapId;
    }

    for (const [mapKey, mapId] of fieldKeyToIssueRelatedToIdMap.entries()) {
      const normalizedMapKey = normalizeFieldKey(mapKey).toLowerCase();
      if (normalizedMapKey.includes(lowerKey) || lowerKey.includes(normalizedMapKey)) {
        return mapId;
      }
    }

    return null;
  };

  // Find issueRelatedTo entry by fieldKey
  const findIssueRelatedTo = (fieldKey: string) => {
    const id = getIssueRelatedToId(fieldKey);
    if (!id) return null;
    return issueRelatedTo.find(irt => irt.id === id) ?? null;
  };

  const getFieldDisplayName = (key: string) => {
    const match = findIssueRelatedTo(key);
    return match?.displayName ?? normalizeFieldKey(key);
  };

  // Count issues for a specific field (only for the logged-in reviewer)
  const getIssueCountForField = (fieldKey: string): number => {
    if (!currentVersion?.smeIssues || !Array.isArray(currentVersion.smeIssues)) return 0;
    const issueRelatedToId = getIssueRelatedToId(fieldKey);
    if (!issueRelatedToId) return 0;

    const loggedInUserId = user?.id;
    if (!loggedInUserId) return 0;

    return currentVersion.smeIssues.filter(issue => issue.issuesRelatedTo?.id === issueRelatedToId && issue.reviewerId === loggedInUserId)
      .length;
  };

  // Get templates for a field
  const getTemplatesForField = (fieldKey: string): SMETemplate[] => {
    if (!fieldKey || !smeTemplates || !Array.isArray(smeTemplates)) return [];
    const issueRelatedToId = getIssueRelatedToId(fieldKey);
    if (!issueRelatedToId) return [];
    return smeTemplates.filter(t => t.issues_related_to_id === issueRelatedToId);
  };

  // Get template dropdown options
  const getTemplateDropdownOptions = (fieldKey: string) => {
    if (!fieldKey) return [];
    const templates = getTemplatesForField(fieldKey);
    if (!templates || templates.length === 0) return [];
    if (!issueDescriptions || !Array.isArray(issueDescriptions)) {
      return templates.map(t => ({ value: t.id, label: `Template ${t.id}` }));
    }

    const uniqueDescriptionIds = [...new Set(templates.map(t => t.issue_description_id).filter(id => id != null))];
    const matchingDescriptions = issueDescriptions.filter(desc => desc.id != null && uniqueDescriptionIds.includes(desc.id));

    return matchingDescriptions.map(desc => {
      const matchingTemplate = templates.find(t => t.issue_description_id === desc.id);
      return {
        value: matchingTemplate?.id ?? 0,
        label: desc.description ?? `Description ${desc.id}`,
      };
    });
  };

  // Handlers
  const handleVersionSelect = (versionId: number) => {
    const index = sortedVersions.findIndex(v => v.id === versionId);
    if (index !== -1) {
      setSelectedVersionIndex(index);
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

  const toggleFieldForm = (fieldKey: string) => {
    if (expandedFieldKey === fieldKey) {
      setExpandedFieldKey(null);
      setSelectedTemplateId('');
    } else {
      setExpandedFieldKey(fieldKey);
      setSelectedTemplateId('');
    }
  };

  const handleSaveFromTemplate = async (fieldKey: string) => {
    if (!noteId || !versionId || !fieldKey || !selectedTemplateId || typeof selectedTemplateId !== 'number' || reviewerId == null) {
      return;
    }
    const revId = typeof reviewerId === 'number' ? reviewerId : null;
    if (revId == null) return;

    setIsSaving(true);
    try {
      const isCurrentVersion = sortedVersions.length > 0 && sortedVersions[0].id === versionId;
      const res = await createSMEIssueFromTemplate({
        note_id: noteId,
        reviewer_id: revId,
        practitioner_id: practitionerId,
        is_current_version: isCurrentVersion ? 1 : 0,
        version_id: versionId,
        template_id: selectedTemplateId,
        ai_status: aiStatusId,
        priority: priorityId,
      });
      if (!res?.id) {
        setIsSaving(false);
        return;
      }
      const template = smeTemplates.find(t => t.id === selectedTemplateId);
      if (!template || !onSMEIssueCreatedFromTemplate) {
        setExpandedFieldKey(null);
        setSelectedTemplateId('');
        setIsSaving(false);
        return;
      }
      const et = errorTypes.find(e => e.id === template.error_type_id);
      const irt = issueRelatedTo.find(i => i.id === template.issues_related_to_id);
      const desc = issueDescriptions.find(d => d.id === template.issue_description_id);
      const issueForm: IssueForm = {
        id: `version-issue-${res.id}`,
        errorType: et?.name ?? '',
        issueRelatedTo: irt?.fieldId ?? '',
        issueDescription: desc?.description ?? '',
        _smeIssueId: res.id,
        _isVersionIssue: true,
      };
      onSMEIssueCreatedFromTemplate(res, issueForm, versionId);
      setExpandedFieldKey(null);
      setSelectedTemplateId('');
    } catch (e) {
      console.error('Create SME issue from template:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format('MMM D, YYYY');
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
              const issueCount = getIssueCountForField(key);

              return (
                <div key={key} className="mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-primary font-semibold">{displayName}:</h4>
                      {isChanged && <Badge className="bg-gradient-light text-primary rounded-sm text-xs font-semibold">CHANGED</Badge>}
                    </div>
                    {onSMEIssueCreatedFromTemplate && versionId && noteId && (
                      <div className="flex items-center gap-2">
                        {issueCount > 0 && UserRoleEnum.superAdmin !== user?.type && (
                          <Badge className="bg-gradient-light text-primary rounded-sm px-2 py-0.5 text-xs font-semibold">
                            {issueCount}
                          </Badge>
                        )}
                        {UserRoleEnum.sme_reviewer === user?.type && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary hover:bg-primary/10 h-7 w-7"
                            onClick={() => toggleFieldForm(key)}
                            title="Add SME issue from template"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Inline form for adding SME issue */}
                  {expandedFieldKey === key && (
                    <div className="mt-3 rounded-lg border bg-white p-4">
                      {getTemplatesForField(key).length === 0 ? (
                        <div className="text-muted-foreground py-4 text-center">
                          <p>No templates available for this field.</p>
                          <p className="mt-2 text-sm">Please configure templates in Settings first.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setExpandedFieldKey(null);
                                  setSelectedTemplateId('');
                                }}
                              >
                                <X />
                              </Button>
                            </div>
                            <Label>Issue description (template)</Label>
                            <Select
                              value={selectedTemplateId === '' ? '' : String(selectedTemplateId)}
                              onValueChange={v => setSelectedTemplateId(v ? parseInt(v, 10) : '')}
                            >
                              <SelectTrigger className="mt-1 w-full">
                                <SelectValue placeholder="Select a description" />
                              </SelectTrigger>
                              <SelectContent>
                                {getTemplateDropdownOptions(key).map(opt => (
                                  <SelectItem key={opt.value} value={String(opt.value)}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setExpandedFieldKey(null);
                                setSelectedTemplateId('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="bg-gradient-light text-primary border-0"
                              disabled={isSaving || selectedTemplateId === '' || getTemplatesForField(key).length === 0}
                              onClick={() => handleSaveFromTemplate(key)}
                            >
                              <Save className="h-4 w-4" />
                              {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Changed field comparison */}
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

                  {/* Regular field value */}
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
            <Button variant="outline" size="icon" onClick={handlePrevious} disabled={isFirstVersion}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext} disabled={isLastVersion}>
              <ChevronRight />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TherapySessionSummaryCard;
