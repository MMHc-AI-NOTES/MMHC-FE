import { describe, it, expect } from 'vitest';
import { getDisplayableSessionFieldEntries, isRawQuestionId } from './sessionFieldUtils';

const keysOf = (data: Record<string, unknown>) => getDisplayableSessionFieldEntries(data).map(([key]) => key);

/** A progress note carries the curated field names. */
const progressNote = {
  'Session Duration': '10am-10:53am',
  Subjective: 'Client presented calm.',
  Objective: 'Alert and oriented.',
  'Assessment & Therapeutic Intervention': 'CBT techniques used.',
  'Plan and Collaboration': 'Continue weekly sessions.',
  'Mental Status (optional)': '',
  'Therapist Initials': 'JD, LMHC',
};

/** An intake note shares at most one field name with a progress note. */
const intakeNote = {
  'First Name:': 'Alex',
  'Last Name:': 'Rivera',
  'Presenting Problem & Symptoms': 'Reports anxiety and poor sleep.',
  'Bio/Psychosocial Assessment': 'No prior treatment history.',
  'Risk Assessment': 'No risk identified.',
  'Family History': 'Three siblings.',
  Strengths: 'Resilience.',
  'Mental Status': '',
};

/** A treatment plan note, including an unlabelled question that fell back to its id. */
const treatmentPlanNote = {
  'First Name:': 'Kayla',
  'Review on': '90',
  '425q-1': 'No',
  'Expected Length of Treatment:': '1 year',
  'Treatment Modality:': 'Individual',
  'Tenative Goals & Plans:': 'Reduce depressive symptoms.',
  'Goal #1 Target Completion Date': '02/08/2026',
};

describe('isRawQuestionId', () => {
  it('recognises an unlabelled PracticeQ question id', () => {
    expect(isRawQuestionId('425q-1')).toBe(true);
    expect(isRawQuestionId('zad8-1')).toBe(true);
    expect(isRawQuestionId('6tx9-12')).toBe(true);
  });

  it('recognises a numbered duplicate of an unlabelled question', () => {
    expect(isRawQuestionId('425q-1 (2)')).toBe(true);
  });

  it('does not mistake a real field name for an id', () => {
    expect(isRawQuestionId('Subjective')).toBe(false);
    expect(isRawQuestionId('Risk Assessment')).toBe(false);
    expect(isRawQuestionId('Goal #1 Target Completion Date')).toBe(false);
    expect(isRawQuestionId('First Name:')).toBe(false);
  });

  it('tolerates surrounding whitespace', () => {
    expect(isRawQuestionId('  425q-1  ')).toBe(true);
  });
});

describe('getDisplayableSessionFieldEntries, progress notes', () => {
  it('uses the curated field list', () => {
    const keys = keysOf(progressNote);

    expect(keys).toContain('Subjective');
    expect(keys).toContain('Assessment & Therapeutic Intervention');
    expect(keys).toContain('Therapist Initials');
  });

  it('keeps curated fields even when empty, so the layout stays consistent', () => {
    expect(keysOf(progressNote)).toContain('Mental Status (optional)');
  });

  it('returns fields in the curated order rather than the stored order', () => {
    const keys = keysOf(progressNote);
    expect(keys.indexOf('Subjective')).toBeLessThan(keys.indexOf('Objective'));
  });
});

describe('getDisplayableSessionFieldEntries, other note types', () => {
  it('shows the intake fields instead of filtering them away', () => {
    const keys = keysOf(intakeNote);

    expect(keys).toContain('Presenting Problem & Symptoms');
    expect(keys).toContain('Bio/Psychosocial Assessment');
    expect(keys).toContain('Risk Assessment');
    expect(keys.length).toBeGreaterThan(3);
  });

  it('drops empty fields so the summary is not padded with blank rows', () => {
    expect(keysOf(intakeNote)).not.toContain('Mental Status');
  });

  it('drops unlabelled questions that fell back to their raw id', () => {
    const keys = keysOf(treatmentPlanNote);

    expect(keys).not.toContain('425q-1');
    expect(keys).toContain('Tenative Goals & Plans:');
  });

  it('preserves the order the fields were stored in', () => {
    const keys = keysOf(treatmentPlanNote);
    expect(keys.indexOf('First Name:')).toBeLessThan(keys.indexOf('Treatment Modality:'));
  });
});

describe('getDisplayableSessionFieldEntries, edge cases', () => {
  it('returns nothing for an empty note rather than throwing', () => {
    expect(getDisplayableSessionFieldEntries({})).toEqual([]);
  });

  it('handles a note whose fields are all empty', () => {
    expect(getDisplayableSessionFieldEntries({ 'Risk Assessment': '', Strengths: '   ' })).toEqual([]);
  });

  it('handles null and undefined values without throwing', () => {
    const keys = keysOf({ 'Risk Assessment': null, Strengths: undefined, 'Family History': 'Two siblings.' });

    expect(keys).toEqual(['Family History']);
  });

  it('keeps non string values such as numbers', () => {
    expect(keysOf({ 'Review on': 90, 'Days on': '02/08/2026', Involvement: 'Individual' })).toContain('Review on');
  });

  it('treats a note matching exactly two curated fields as another note type', () => {
    // Two matches is below the threshold, so its own fields are shown.
    const keys = keysOf({ Subjective: 'x', Objective: 'y', 'Risk Assessment': 'z' });

    expect(keys).toContain('Risk Assessment');
  });

  it('treats a note matching three curated fields as a progress note', () => {
    const keys = keysOf({ Subjective: 'x', Objective: 'y', 'Plan and Collaboration': 'z', 'Risk Assessment': 'ignored' });

    expect(keys).not.toContain('Risk Assessment');
  });
});
