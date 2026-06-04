import type { ApiNoteDetail, DiagnosisItem } from '@/types/notes';

const normalizeDiagnosisItem = (item: Record<string, unknown>): DiagnosisItem => ({
  code: String(item.Code ?? item.code ?? ''),
  date: (item.Date ?? item.date) as DiagnosisItem['date'],
  description: String(item.Description ?? item.description ?? '').trim(),
  endDate: (item.EndDate ?? item.endDate) as DiagnosisItem['endDate'],
  noteId: item.NoteId != null ? String(item.NoteId) : item.noteId != null ? String(item.noteId) : undefined,
});

/** Parse Diagnosis array from note detail API (PascalCase or camelCase). */
export const parseDiagnosisFromApi = (apiData: ApiNoteDetail): DiagnosisItem[] => {
  const api = apiData as ApiNoteDetail & Record<string, unknown>;
  const patient = api.patient as Record<string, unknown> | undefined;
  const raw = api.Diagnosis ?? api.diagnosis ?? patient?.Diagnosis ?? patient?.diagnosis;

  if (!Array.isArray(raw)) return [];

  return raw.filter((item): item is Record<string, unknown> => item != null && typeof item === 'object').map(normalizeDiagnosisItem);
};
