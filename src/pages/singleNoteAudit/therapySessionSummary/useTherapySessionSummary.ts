import { useState, useMemo, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/store/store';
import { WebhookVersion, PreviousNote } from '@/types/notes';
import { fetchSMETemplates, fetchIssueRelatedTo, fetchIssueDescriptions } from '@/pages/settings/settingsApiCalls';
import { setSMETemplates, setIssueRelatedTo, setIssueDescriptions } from '@/store/slices/smeConfigSlice';
import moment from 'moment';
import { DATE_FORMAT } from '@/constants/common';
import { createSMEIssueFromTemplate } from '../singleNoteApiCalls';
// import { createSMEIssueOverall } from '../singleNoteApiCalls';
import type { IssueForm } from '../components/types';
import type { SMETemplate } from '@/pages/settings/settingsApiCalls';
import type { NoteDetail } from '@/types/notes';
import {
  formatSessionFieldValue,
  getAiIssuesForField,
  getUnmatchedAiIssues,
  getDisplayableSessionFieldEntries,
  getSessionFieldDisplayName,
} from './sessionFieldUtils';

const formatDate = (dateString: string) => moment(dateString).format(DATE_FORMAT);

export interface UseTherapySessionSummaryProps {
  webhookVersions: WebhookVersion[];
  previousNoteFromDetail?: PreviousNote;
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
  /** Called when an issue is created so SME Review can re-enable "Marked For Review" */
  onReviewerIssuesChanged?: (reviewerId: number) => void;
  initialVersionIndex?: number;
  /** When true, session data comes from latest version's previous_note (for Previous Session card) */
  sourcePreviousSessionFromNote?: boolean;
  /** AI-identified issues from note detail, mapped to session fields in the UI */
  aiIssues?: NoteDetail['issues'];
}

const normalizeFieldKey = (key: string): string => {
  if (!key) return '';
  return key.replace(/\s*\(optional\)/gi, '').trim();
};

export function useTherapySessionSummary({
  webhookVersions,
  previousNoteFromDetail,
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
  sourcePreviousSessionFromNote = false,
  aiIssues = [],
}: UseTherapySessionSummaryProps) {
  const dispatch = useDispatch();
  const { issueRelatedTo, smeTemplates, issueDescriptions, errorTypes } = useAppSelector(state => state.smeConfig);
  const user = useAppSelector(state => state.auth.user);

  const [expandedFieldKey, setExpandedFieldKey] = useState<string | null>(null);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(initialVersionIndex);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  // Previous overall method – overall now uses same flow as other fields (SessionFieldRow)
  // const [isOverallFormOpen, setIsOverallFormOpen] = useState(false);
  // const [overallErrorTypeId, setOverallErrorTypeId] = useState<number>(1);
  // const [overallComment, setOverallComment] = useState('');
  // const [isSavingOverall, setIsSavingOverall] = useState(false);

  const sortedVersions = useMemo(() => [...webhookVersions].sort((a, b) => b.id - a.id), [webhookVersions]);

  useEffect(() => {
    if (!sortedVersions.length) return;
    if (selectedVersionIndex > sortedVersions.length - 1) {
      setSelectedVersionIndex(Math.max(0, sortedVersions.length - 1));
    }
  }, [sortedVersions.length, selectedVersionIndex]);

  useEffect(() => {
    if (versionId != null && sortedVersions.length > 0) {
      const index = sortedVersions.findIndex(v => v.id === versionId);
      if (index !== -1 && index !== selectedVersionIndex) {
        setSelectedVersionIndex(index);
      }
    }
  }, [versionId, sortedVersions, selectedVersionIndex]);

  const overallIssueRelatedToId = useMemo(() => {
    const irt = issueRelatedTo?.find(opt => (opt.fieldId || '').toLowerCase() === 'overall');
    return irt?.id ?? null;
  }, [issueRelatedTo]);

  const currentVersion = sortedVersions[selectedVersionIndex];
  const latestVersion = sortedVersions[0] ?? null;
  const previousVersion = selectedVersionIndex < sortedVersions.length - 1 ? sortedVersions[selectedVersionIndex + 1] : null;
  const isHistoricalVersion = selectedVersionIndex > 0;
  const isFirstVersion = selectedVersionIndex === sortedVersions.length - 1;
  const isLastVersion = selectedVersionIndex === 0;

  const currentSessionData = useMemo(() => {
    const previousNote =
      previousNoteFromDetail ??
      latestVersion?.previous_note ??
      (latestVersion as { previousNote?: { session?: string; sessionJson?: string } })?.previousNote;
    if (sourcePreviousSessionFromNote && previousNote) {
      const sessionStr = previousNote.session ?? previousNote.sessionJson;
      if (sessionStr) {
        try {
          return JSON.parse(sessionStr);
        } catch {
          return {};
        }
      }
      return {};
    }
    if (!currentVersion?.sessionJson) return {};
    try {
      return JSON.parse(currentVersion.sessionJson);
    } catch {
      return {};
    }
  }, [previousNoteFromDetail, latestVersion, sourcePreviousSessionFromNote, currentVersion.sessionJson]);

  const displayableSessionFields = useMemo(() => getDisplayableSessionFieldEntries(currentSessionData), [currentSessionData]);

  const hasPreviousSessionData = useMemo(() => {
    if (sourcePreviousSessionFromNote) {
      if (previousNoteFromDetail) return true;
      if (latestVersion) {
        const prev = latestVersion.previous_note ?? (latestVersion as { previousNote?: unknown }).previousNote;
        return Boolean(prev);
      }
      return false;
    }
    return sortedVersions.length >= 2;
  }, [sourcePreviousSessionFromNote, sortedVersions.length, previousNoteFromDetail, latestVersion]);

  const previousSessionData = useMemo(() => {
    if (!previousVersion?.sessionJson) return {};
    try {
      return JSON.parse(previousVersion.sessionJson);
    } catch {
      return {};
    }
  }, [previousVersion]);

  const previousNoteSessionData = useMemo(() => {
    const previousNote =
      previousNoteFromDetail ?? latestVersion?.previous_note ?? (latestVersion as { previousNote?: PreviousNote })?.previousNote;
    if (!previousNote) return {};
    const sessionStr = previousNote.session ?? previousNote.sessionJson;
    if (!sessionStr) return {};
    try {
      return JSON.parse(sessionStr);
    } catch {
      return {};
    }
  }, [previousNoteFromDetail, latestVersion]);

  const hasPreviousNoteSessionData = useMemo(() => Object.keys(previousNoteSessionData).length > 0, [previousNoteSessionData]);

  const changedFields = useMemo(() => {
    if (!previousVersion) return [];
    const changes: Array<{ key: string; previous: string; current: string }> = [];
    displayableSessionFields.forEach(([key]) => {
      const currentValue = String(currentSessionData[key] || '').trim();
      const previousValue = String(previousSessionData[key] || '').trim();
      if (currentValue !== previousValue) {
        changes.push({ key, previous: previousValue || '-', current: currentValue || '-' });
      }
    });
    return changes;
  }, [currentSessionData, previousSessionData, previousVersion, displayableSessionFields]);

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
      const displayName = getSessionFieldDisplayName(key);
      if (displayName) return displayName;
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

  const getSmeIssuesForField = useCallback(
    (fieldKey: string) => {
      if (!currentVersion?.smeIssues || !Array.isArray(currentVersion.smeIssues)) return [];
      const issueRelatedToId = getIssueRelatedToId(fieldKey);
      if (!issueRelatedToId) return [];
      return currentVersion.smeIssues.filter(issue => issue.issuesRelatedTo?.id === issueRelatedToId);
    },
    [currentVersion?.smeIssues, getIssueRelatedToId],
  );

  const getAiIssuesForSessionField = useCallback(
    (fieldKey: string) => getAiIssuesForField(fieldKey, getFieldDisplayName(fieldKey), aiIssues),
    [aiIssues, getFieldDisplayName],
  );

  /**
   * Findings no field will draw. Previously these were dropped without trace,
   * which is why notes other than progress notes appeared to have no AI review
   * at all: their findings come back against the section "Overall".
   */
  const unmatchedAiIssues = useMemo(
    () => getUnmatchedAiIssues(aiIssues, displayableSessionFields, getFieldDisplayName),
    [aiIssues, displayableSessionFields, getFieldDisplayName],
  );

  const getPreviousValueForField = useCallback(
    (fieldKey: string) => formatSessionFieldValue(previousNoteSessionData[fieldKey]),
    [previousNoteSessionData],
  );

  const isFieldChangedFromPreviousNote = useCallback(
    (fieldKey: string) => {
      const currentValue = formatSessionFieldValue(currentSessionData[fieldKey]);
      const previousValue = getPreviousValueForField(fieldKey);
      if (currentValue === '-' && previousValue === '-') return false;
      return currentValue !== previousValue;
    },
    [currentSessionData, getPreviousValueForField],
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
          return { value: t.id, label: `Template ${t.id}` };
        });
      }
      const uniqueDescriptionIds = [...new Set(templates.map(t => t.issue_description_id).filter(id => id != null))];
      const matchingDescriptions = issueDescriptions.filter(desc => desc.id != null && uniqueDescriptionIds.includes(desc.id));
      return matchingDescriptions.map(desc => {
        const matchingTemplate = templates.find(t => t.issue_description_id === desc.id);
        return {
          value: matchingTemplate?.id ?? 0,
          label: desc.description ?? `Description ${desc.id}`,
          descriptionId: desc.id ?? undefined,
        };
      });
    },
    [getTemplatesForField, issueDescriptions],
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
    setSelectedTemplateIds([]);
  }, []);

  const handleSaveFromTemplate = useCallback(
    async (fieldKey: string, commentsByTemplateId?: Record<number, string>) => {
      if (!noteId || !versionId || !fieldKey || selectedTemplateIds.length === 0 || reviewerId == null) return;
      const revId = typeof reviewerId === 'number' ? reviewerId : null;
      if (revId == null) return;

      setIsSaving(true);
      try {
        const isCurrentVersion = sortedVersions.length > 0 && sortedVersions[0].id === versionId;
        for (const templateId of selectedTemplateIds) {
          const res = await createSMEIssueFromTemplate({
            note_id: noteId,
            reviewer_id: revId,
            practitioner_id: practitionerId,
            is_current_version: isCurrentVersion ? 1 : 0,
            version_id: versionId,
            template_id: templateId,
            ai_status: aiStatusId,
            priority: priorityId,
            comment: (commentsByTemplateId?.[templateId] ?? '').trim(),
          });
          const createdId = res?.id || res?.data?.id || res?.data?.smeIssue?.id;
          if (!createdId) continue;

          const template = smeTemplates.find(t => t.id === templateId);
          if (!template || !onSMEIssueCreatedFromTemplate) {
            continue;
          }
          const et = errorTypes.find(e => e.id === template.error_type_id);
          const irt = issueRelatedTo.find(i => i.id === template.issues_related_to_id);
          const desc = issueDescriptions.find(d => d.id === template.issue_description_id);
          const issueForm: IssueForm = {
            id: `version-issue-${createdId}`,
            errorType: et?.name ?? '',
            issueRelatedTo: irt?.fieldId ?? '',
            issueDescription: desc?.description ?? '',
            comment: (commentsByTemplateId?.[templateId] ?? '').trim(),
            _smeIssueId: createdId,
            _isVersionIssue: true,
          };
          onSMEIssueCreatedFromTemplate({ id: createdId }, issueForm, versionId, template.issue_description_id ?? undefined, revId);
          onReviewerIssuesChanged?.(revId);
        }
        setExpandedFieldKey(null);
        setSelectedTemplateIds([]);
      } catch (e) {
        console.error('Create SME issue from template:', e);
      } finally {
        setIsSaving(false);
      }
    },
    [
      noteId,
      versionId,
      selectedTemplateIds,
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
    setSelectedTemplateIds([]);
  }, []);

  // Previous overall method – overall now uses same flow as other fields (handleSaveFromTemplate)
  // const openOverallForm = useCallback(() => setIsOverallFormOpen(true), []);
  // const closeOverallForm = useCallback(() => {
  //   setIsOverallFormOpen(false);
  //   setOverallComment('');
  // }, []);
  // const handleSaveOverallIssue = useCallback(async () => {
  //   if (!noteId || !versionId || reviewerId == null || overallIssueRelatedToId == null || !onSMEIssueCreatedFromTemplate) return;
  //   const revId = typeof reviewerId === 'number' ? reviewerId : null;
  //   if (revId == null) return;
  //   setIsSavingOverall(true);
  //   try {
  //     const isCurrentVersion = sortedVersions.length > 0 && sortedVersions[0].id === versionId;
  //     const res = await createSMEIssueOverall({
  //       note_id: noteId,
  //       reviewer_id: revId,
  //       practitioner_id: practitionerId,
  //       is_current_version: isCurrentVersion ? 1 : 0,
  //       version_id: versionId,
  //       error_type_id: overallErrorTypeId,
  //       issues_related_to_id: overallIssueRelatedToId,
  //       comment: overallComment.trim(),
  //       ai_status: aiStatusId,
  //       priority: priorityId,
  //     });
  //     if (!res?.id) return;
  //     const et = errorTypes.find(e => e.id === overallErrorTypeId);
  //     const irt = issueRelatedTo.find(i => i.id === overallIssueRelatedToId);
  //     const issueForm: IssueForm = {
  //       id: `version-issue-${res.id}`,
  //       errorType: et?.name ?? '',
  //       issueRelatedTo: irt?.fieldId ?? 'overall',
  //       issueDescription: overallComment.trim(),
  //       _smeIssueId: res.id,
  //       _isVersionIssue: true,
  //     };
  //     onSMEIssueCreatedFromTemplate(res, issueForm, versionId, undefined, revId);
  //     onReviewerIssuesChanged?.(revId);
  //     closeOverallForm();
  //   } catch (e) {
  //     console.error('Create overall SME issue:', e);
  //   } finally {
  //     setIsSavingOverall(false);
  //   }
  // }, [noteId, versionId, reviewerId, overallIssueRelatedToId, overallErrorTypeId, overallComment, practitionerId, sortedVersions, aiStatusId, priorityId, errorTypes, issueRelatedTo, onSMEIssueCreatedFromTemplate, onReviewerIssuesChanged, closeOverallForm]);

  return {
    user,
    sortedVersions,
    currentVersion,
    currentSessionData,
    displayableSessionFields,
    hasPreviousSessionData,
    previousNoteSessionData,
    hasPreviousNoteSessionData,
    changedFields,
    selectedVersionIndex,
    isVersionHistoryOpen,
    setIsVersionHistoryOpen,
    isHistoricalVersion,
    isFirstVersion,
    isLastVersion,
    expandedFieldKey,
    selectedTemplateIds,
    setSelectedTemplateIds,
    isSaving,
    getFieldDisplayName,
    getIssueCountForField,
    getSmeIssuesForField,
    getAiIssuesForSessionField,
    unmatchedAiIssues,
    getPreviousValueForField,
    isFieldChangedFromPreviousNote,
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
    // isOverallFormOpen,
    // openOverallForm,
    // closeOverallForm,
    // overallErrorTypeId,
    // setOverallErrorTypeId,
    // overallComment,
    // setOverallComment,
    // isSavingOverall,
    // handleSaveOverallIssue,
    errorTypes,
  };
}
