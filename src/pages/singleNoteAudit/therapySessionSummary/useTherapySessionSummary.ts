import { useState, useMemo, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/store/store';
import { WebhookVersion } from '@/types/notes';
import { fetchSMETemplates, fetchIssueRelatedTo, fetchIssueDescriptions } from '@/pages/settings/settingsApiCalls';
import { setSMETemplates, setIssueRelatedTo, setIssueDescriptions } from '@/store/slices/smeConfigSlice';
import moment from 'moment';
import { createSMEIssueFromTemplate, createSMEIssueOverall } from '../singleNoteApiCalls';
import type { IssueForm } from '../components/types';
import type { SMETemplate } from '@/pages/settings/settingsApiCalls';

const formatDate = (dateString: string) => moment(dateString).format('MMM D, YYYY');

export interface UseTherapySessionSummaryProps {
  webhookVersions: WebhookVersion[];
  onVersionChange?: (versionId: number) => void;
  noteId?: string;
  versionId?: number | null;
  reviewerId?: number | null;
  practitionerId?: number;
  aiStatusId?: number;
  priorityId?: number;
  onSMEIssueCreatedFromTemplate?: (
    response: { id: number },
    issueForm: IssueForm,
    versionId: number,
    descriptionId?: number,
    createdForReviewerId?: number,
  ) => void;
  /** Called when an issue is created so SME Review can re-enable "Mark For Review" */
  onReviewerIssuesChanged?: (reviewerId: number) => void;
  initialVersionIndex?: number;
}

const normalizeFieldKey = (key: string): string => {
  if (!key) return '';
  return key.replace(/\s*\(optional\)/gi, '').trim();
};

export function useTherapySessionSummary({
  webhookVersions,
  onVersionChange,
  noteId,
  versionId,
  reviewerId,
  practitionerId = 0,
  aiStatusId = 1,
  priorityId = 1,
  onSMEIssueCreatedFromTemplate,
  onReviewerIssuesChanged,
  initialVersionIndex = 0,
}: UseTherapySessionSummaryProps) {
  const dispatch = useDispatch();
  const { issueRelatedTo, smeTemplates, issueDescriptions, errorTypes } = useAppSelector(state => state.smeConfig);
  const user = useAppSelector(state => state.auth.user);

  const [expandedFieldKey, setExpandedFieldKey] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | ''>('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(initialVersionIndex);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isOverallFormOpen, setIsOverallFormOpen] = useState(false);
  const [overallErrorTypeId, setOverallErrorTypeId] = useState<number>(1);
  const [overallComment, setOverallComment] = useState('');
  const [isSavingOverall, setIsSavingOverall] = useState(false);

  const sortedVersions = useMemo(() => [...webhookVersions].sort((a, b) => b.id - a.id), [webhookVersions]);

  useEffect(() => {
    if (!sortedVersions.length) return;
    if (selectedVersionIndex > sortedVersions.length - 1) {
      setSelectedVersionIndex(Math.max(0, sortedVersions.length - 1));
    }
  }, [sortedVersions.length, selectedVersionIndex]);

  const overallIssueRelatedToId = useMemo(() => {
    const irt = issueRelatedTo?.find(opt => (opt.fieldId || '').toLowerCase() === 'overall');
    return irt?.id ?? null;
  }, [issueRelatedTo]);

  const currentVersion = sortedVersions[selectedVersionIndex];
  const previousVersion = selectedVersionIndex < sortedVersions.length - 1 ? sortedVersions[selectedVersionIndex + 1] : null;
  const isHistoricalVersion = selectedVersionIndex > 0;
  const isFirstVersion = selectedVersionIndex === sortedVersions.length - 1;
  const isLastVersion = selectedVersionIndex === 0;

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

  const changedFields = useMemo(() => {
    if (!previousVersion) return [];
    const changes: Array<{ key: string; previous: string; current: string }> = [];
    Object.keys(currentSessionData).forEach(key => {
      const currentValue = String(currentSessionData[key] || '').trim();
      const previousValue = String(previousSessionData[key] || '').trim();
      if (currentValue !== previousValue) {
        changes.push({ key, previous: previousValue || '-', current: currentValue || '-' });
      }
    });
    return changes;
  }, [currentSessionData, previousSessionData, previousVersion]);

  const fieldKeyToIssueRelatedToIdMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!issueRelatedTo || !Array.isArray(issueRelatedTo)) return map;
    issueRelatedTo.forEach(irt => {
      if (irt.id) {
        if (irt.displayName) {
          const normalizedDisplayName = normalizeFieldKey(irt.displayName);
          map.set(irt.displayName, irt.id);
          if (normalizedDisplayName !== irt.displayName) map.set(normalizedDisplayName, irt.id);
        }
        if (irt.fieldId) {
          const normalizedFieldId = normalizeFieldKey(irt.fieldId);
          map.set(irt.fieldId, irt.id);
          if (normalizedFieldId !== irt.fieldId) map.set(normalizedFieldId, irt.id);
        }
      }
    });
    return map;
  }, [issueRelatedTo]);

  const getIssueRelatedToId = useCallback(
    (fieldKey: string): number | null => {
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
        if (normalizedMapKey.includes(lowerKey) || lowerKey.includes(normalizedMapKey)) return mapId;
      }
      return null;
    },
    [fieldKeyToIssueRelatedToIdMap],
  );

  const findIssueRelatedTo = useCallback(
    (fieldKey: string) => {
      const id = getIssueRelatedToId(fieldKey);
      if (!id) return null;
      return issueRelatedTo.find(irt => irt.id === id) ?? null;
    },
    [getIssueRelatedToId, issueRelatedTo],
  );

  const getFieldDisplayName = useCallback(
    (key: string) => {
      const match = findIssueRelatedTo(key);
      return match?.displayName ?? normalizeFieldKey(key);
    },
    [findIssueRelatedTo],
  );

  const getIssueCountForOverall = useCallback((): number => {
    if (!currentVersion?.smeIssues || !Array.isArray(currentVersion.smeIssues) || !user?.id || overallIssueRelatedToId == null) return 0;
    return currentVersion.smeIssues.filter(issue => issue.issuesRelatedTo?.id === overallIssueRelatedToId && issue.reviewerId === user.id)
      .length;
  }, [currentVersion?.smeIssues, user?.id, overallIssueRelatedToId]);

  const getIssueCountForField = useCallback(
    (fieldKey: string): number => {
      if (!currentVersion?.smeIssues || !Array.isArray(currentVersion.smeIssues) || !user?.id) return 0;
      const issueRelatedToId = getIssueRelatedToId(fieldKey);
      if (!issueRelatedToId) return 0;
      return currentVersion.smeIssues.filter(issue => issue.issuesRelatedTo?.id === issueRelatedToId && issue.reviewerId === user.id)
        .length;
    },
    [currentVersion?.smeIssues, getIssueRelatedToId, user?.id],
  );

  const getTemplatesForField = useCallback(
    (fieldKey: string): SMETemplate[] => {
      if (!fieldKey || !smeTemplates || !Array.isArray(smeTemplates)) return [];
      const issueRelatedToId = getIssueRelatedToId(fieldKey);
      if (!issueRelatedToId) return [];
      return smeTemplates.filter(t => t.issues_related_to_id === issueRelatedToId);
    },
    [getIssueRelatedToId, smeTemplates],
  );

  // Reviewer we're adding issues for (prop); used so "already used" is for that reviewer's issues (creating or editing)
  const effectiveReviewerId = typeof reviewerId === 'number' ? reviewerId : (user?.id ?? null);

  const getAlreadyUsedDescriptionIdsForField = useCallback(
    (fieldKey: string): number[] => {
      if (!currentVersion?.smeIssues || !Array.isArray(currentVersion.smeIssues) || effectiveReviewerId == null) return [];
      const issueRelatedToId = getIssueRelatedToId(fieldKey);
      if (!issueRelatedToId) return [];
      const ids: number[] = [];
      for (const issue of currentVersion.smeIssues) {
        if (issue.issuesRelatedTo?.id !== issueRelatedToId || Number(issue.reviewerId) !== effectiveReviewerId) continue;
        const fromIssueDesc = issue.issueDescription?.id;
        if (fromIssueDesc != null) {
          ids.push(fromIssueDesc);
          continue;
        }
        const descText = typeof issue.description === 'string' ? issue.description : undefined;
        if (descText && issueDescriptions?.length) {
          const matched = issueDescriptions.find(d => d.description === descText);
          if (matched?.id != null) ids.push(matched.id);
        }
      }
      return [...new Set(ids)];
    },
    [currentVersion?.smeIssues, getIssueRelatedToId, effectiveReviewerId, issueDescriptions],
  );

  const getTemplateDropdownOptions = useCallback(
    (fieldKey: string): { value: number; label: string; descriptionId?: number }[] => {
      if (!fieldKey) return [];
      const templates = getTemplatesForField(fieldKey);
      if (!templates?.length) return [];
      if (!issueDescriptions || !Array.isArray(issueDescriptions)) {
        return templates.map(t => {
          const errorType = errorTypes?.find(e => e.id === t.error_type_id);
          const pointsStr = errorType?.points != null ? ` (${errorType.points} pts)` : '';
          return { value: t.id, label: `Template ${t.id}${pointsStr}` };
        });
      }
      const uniqueDescriptionIds = [...new Set(templates.map(t => t.issue_description_id).filter(id => id != null))];
      const matchingDescriptions = issueDescriptions.filter(desc => desc.id != null && uniqueDescriptionIds.includes(desc.id));
      return matchingDescriptions.map(desc => {
        const matchingTemplate = templates.find(t => t.issue_description_id === desc.id);
        const errorType = errorTypes?.find(e => e.id === matchingTemplate?.error_type_id);
        const pointsStr = errorType?.points != null ? ` (${errorType.points} pts)` : '';
        const baseLabel = desc.description ?? `Description ${desc.id}`;
        return {
          value: matchingTemplate?.id ?? 0,
          label: `${baseLabel}${pointsStr}`,
          descriptionId: desc.id ?? undefined,
        };
      });
    },
    [getTemplatesForField, issueDescriptions, errorTypes],
  );

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

  const handleVersionSelect = useCallback(
    (vId: number) => {
      const index = sortedVersions.findIndex(v => v.id === vId);
      if (index !== -1) {
        setSelectedVersionIndex(index);
        onVersionChange?.(sortedVersions[index].id);
      }
    },
    [sortedVersions, onVersionChange],
  );

  const handlePrevious = useCallback(() => {
    if (!isFirstVersion) {
      const newIndex = selectedVersionIndex + 1;
      setSelectedVersionIndex(newIndex);
      onVersionChange?.(sortedVersions[newIndex].id);
    }
  }, [isFirstVersion, selectedVersionIndex, sortedVersions, onVersionChange]);

  const handleNext = useCallback(() => {
    if (!isLastVersion) {
      const newIndex = selectedVersionIndex - 1;
      setSelectedVersionIndex(newIndex);
      onVersionChange?.(sortedVersions[newIndex].id);
    }
  }, [isLastVersion, selectedVersionIndex, sortedVersions, onVersionChange]);

  const toggleFieldForm = useCallback((fieldKey: string) => {
    setExpandedFieldKey(prev => (prev === fieldKey ? null : fieldKey));
    setSelectedTemplateId('');
  }, []);

  const handleSaveFromTemplate = useCallback(
    async (fieldKey: string, comment?: string) => {
      if (!noteId || !versionId || !fieldKey || selectedTemplateId === '' || typeof selectedTemplateId !== 'number' || reviewerId == null)
        return;
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
          comment: (comment ?? '').trim(),
        });
        if (!res?.id) return;

        const template = smeTemplates.find(t => t.id === selectedTemplateId);
        if (!template || !onSMEIssueCreatedFromTemplate) {
          setExpandedFieldKey(null);
          setSelectedTemplateId('');
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
          comment: (comment ?? '').trim(),
          _smeIssueId: res.id,
          _isVersionIssue: true,
        };
        onSMEIssueCreatedFromTemplate(res, issueForm, versionId, template.issue_description_id ?? undefined, revId);
        onReviewerIssuesChanged?.(revId);
        setExpandedFieldKey(null);
        setSelectedTemplateId('');
      } catch (e) {
        console.error('Create SME issue from template:', e);
      } finally {
        setIsSaving(false);
      }
    },
    [
      noteId,
      versionId,
      selectedTemplateId,
      reviewerId,
      practitionerId,
      sortedVersions,
      aiStatusId,
      priorityId,
      smeTemplates,
      errorTypes,
      issueRelatedTo,
      issueDescriptions,
      onSMEIssueCreatedFromTemplate,
      onReviewerIssuesChanged,
    ],
  );

  const closeTemplateForm = useCallback(() => {
    setExpandedFieldKey(null);
    setSelectedTemplateId('');
  }, []);

  const openOverallForm = useCallback(() => setIsOverallFormOpen(true), []);
  const closeOverallForm = useCallback(() => {
    setIsOverallFormOpen(false);
    setOverallComment('');
  }, []);

  const handleSaveOverallIssue = useCallback(async () => {
    if (!noteId || !versionId || reviewerId == null || overallIssueRelatedToId == null || !onSMEIssueCreatedFromTemplate) return;
    const revId = typeof reviewerId === 'number' ? reviewerId : null;
    if (revId == null) return;

    setIsSavingOverall(true);
    try {
      const isCurrentVersion = sortedVersions.length > 0 && sortedVersions[0].id === versionId;
      const res = await createSMEIssueOverall({
        note_id: noteId,
        reviewer_id: revId,
        practitioner_id: practitionerId,
        is_current_version: isCurrentVersion ? 1 : 0,
        version_id: versionId,
        error_type_id: overallErrorTypeId,
        issues_related_to_id: overallIssueRelatedToId,
        comment: overallComment.trim(),
        ai_status: aiStatusId,
        priority: priorityId,
      });
      if (!res?.id) return;

      const et = errorTypes.find(e => e.id === overallErrorTypeId);
      const irt = issueRelatedTo.find(i => i.id === overallIssueRelatedToId);
      const issueForm: IssueForm = {
        id: `version-issue-${res.id}`,
        errorType: et?.name ?? '',
        issueRelatedTo: irt?.fieldId ?? 'overall',
        issueDescription: overallComment.trim(),
        _smeIssueId: res.id,
        _isVersionIssue: true,
      };
      onSMEIssueCreatedFromTemplate(res, issueForm, versionId, undefined, revId);
      onReviewerIssuesChanged?.(revId);
      closeOverallForm();
    } catch (e) {
      console.error('Create overall SME issue:', e);
    } finally {
      setIsSavingOverall(false);
    }
  }, [
    noteId,
    versionId,
    reviewerId,
    overallIssueRelatedToId,
    overallErrorTypeId,
    overallComment,
    practitionerId,
    sortedVersions,
    aiStatusId,
    priorityId,
    errorTypes,
    issueRelatedTo,
    onSMEIssueCreatedFromTemplate,
    onReviewerIssuesChanged,
    closeOverallForm,
  ]);

  return {
    user,
    sortedVersions,
    currentVersion,
    currentSessionData,
    changedFields,
    selectedVersionIndex,
    isVersionHistoryOpen,
    setIsVersionHistoryOpen,
    isHistoricalVersion,
    isFirstVersion,
    isLastVersion,
    expandedFieldKey,
    selectedTemplateId,
    setSelectedTemplateId,
    isSaving,
    getFieldDisplayName,
    getIssueCountForField,
    getTemplatesForField,
    getAlreadyUsedDescriptionIdsForField,
    getTemplateDropdownOptions,
    handleVersionSelect,
    handlePrevious,
    handleNext,
    toggleFieldForm,
    handleSaveFromTemplate,
    closeTemplateForm,
    formatDate,
    overallIssueRelatedToId,
    getIssueCountForOverall,
    isOverallFormOpen,
    openOverallForm,
    closeOverallForm,
    overallErrorTypeId,
    setOverallErrorTypeId,
    overallComment,
    setOverallComment,
    isSavingOverall,
    handleSaveOverallIssue,
    errorTypes,
  };
}
