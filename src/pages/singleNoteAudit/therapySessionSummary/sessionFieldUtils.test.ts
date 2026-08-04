import { describe, it, expect } from 'vitest';
import {
  fieldsMatch,
  getAiIssuesForField,
  getDisplayableSessionFieldEntries,
  getUnmatchedAiIssues,
  isPatientIdentifierField,
  isRawQuestionId,
} from './sessionFieldUtils';
import type { NoteDetail } from '@/types/notes';

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

/* -------------------------------------------------------------------------- */
/* Unmatched AI findings                                                       */
/* -------------------------------------------------------------------------- */

const issue = (category: string, overrides: Partial<NoteDetail['issues'][number]> = {}): NoteDetail['issues'][number] =>
  ({
    severity: 'MODERATE',
    category,
    points: 15,
    description: `finding for ${category || '(blank)'}`,
    justification: '',
    sectionId: '',
    descriptionId: '',
    confidence: 0.9,
    evidence: '',
    ...overrides,
  }) as NoteDetail['issues'][number];

/** Display name resolver standing in for the hook's getFieldDisplayName. */
const displayName = (key: string) => key;

const progressFields: [string, unknown][] = [
  ['Subjective', 'x'],
  ['Objective', 'y'],
  ['Plan and Collaboration', 'z'],
];

const intakeFields: [string, unknown][] = [
  ['Presenting Problem & Symptoms', 'x'],
  ['Family History', 'y'],
  ['Risk Assessment', 'z'],
];

describe('getUnmatchedAiIssues', () => {
  it('returns nothing when there are no findings', () => {
    expect(getUnmatchedAiIssues([], progressFields, displayName)).toEqual([]);
  });

  it('returns nothing when every finding matches a field', () => {
    const issues = [issue('Subjective'), issue('Objective')];

    expect(getUnmatchedAiIssues(issues, progressFields, displayName)).toEqual([]);
  });

  it('surfaces an Overall finding, which matches no field on any note type', () => {
    // The exact case that hid annotations on intake, treatment plan and
    // termination notes.
    const issues = [issue('Overall')];

    expect(getUnmatchedAiIssues(issues, intakeFields, displayName)).toHaveLength(1);
  });

  it('surfaces a finding whose section is blank rather than dropping it', () => {
    expect(getUnmatchedAiIssues([issue('')], progressFields, displayName)).toHaveLength(1);
  });

  it('surfaces every finding when the note has no displayable fields', () => {
    const issues = [issue('Subjective'), issue('Overall')];

    expect(getUnmatchedAiIssues(issues, [], displayName)).toHaveLength(2);
  });

  it('separates matched from unmatched in a mixed set', () => {
    const issues = [issue('Subjective'), issue('Overall'), issue('Objective'), issue('Unknown Section')];
    const unmatched = getUnmatchedAiIssues(issues, progressFields, displayName);

    expect(unmatched.map(i => i.category)).toEqual(['Overall', 'Unknown Section']);
  });

  it('treats an optional suffix as the same field', () => {
    const fields: [string, unknown][] = [['Mental Status (optional)', 'x']];

    expect(getUnmatchedAiIssues([issue('Mental Status')], fields, displayName)).toEqual([]);
  });

  it('matches case insensitively', () => {
    expect(getUnmatchedAiIssues([issue('subjective')], progressFields, displayName)).toEqual([]);
  });

  it('keeps duplicates rather than collapsing them', () => {
    // Two genuine findings can share a section. Deduping here would hide one.
    const issues = [issue('Overall'), issue('Overall')];

    expect(getUnmatchedAiIssues(issues, progressFields, displayName)).toHaveLength(2);
  });

  it('uses the resolved display name, not just the raw key', () => {
    // Fields arrive keyed by raw id on note types with no mapping.
    const fields: [string, unknown][] = [['425q-1', 'No']];
    const resolve = (key: string) => (key === '425q-1' ? 'Risk or Safety Concerns' : key);

    expect(getUnmatchedAiIssues([issue('Risk or Safety Concerns')], fields, resolve)).toEqual([]);
  });

  it('every finding lands in exactly one place, under a field or in the unmatched set', () => {
    // The invariant that makes a silent drop impossible.
    const issues = [issue('Subjective'), issue('Overall'), issue(''), issue('Objective')];

    const matched = progressFields.flatMap(([key]) => getAiIssuesForField(key, displayName(key), issues));
    const unmatched = getUnmatchedAiIssues(issues, progressFields, displayName);

    expect(matched.length + unmatched.length).toBe(issues.length);
  });
});

describe('fieldsMatch blank handling', () => {
  it('a blank section matches no field, so it cannot duplicate across the note', () => {
    // Substring matching runs both ways and every string contains "", so
    // without a guard a section-less finding renders under every field.
    expect(fieldsMatch('Subjective', 'Subjective', '')).toBe(false);
    expect(fieldsMatch('Objective', 'Objective', '   ')).toBe(false);
  });

  it('a blank field never swallows a real section', () => {
    expect(fieldsMatch('', '', 'Overall')).toBe(false);
  });

  it('still matches a real section against a real field', () => {
    expect(fieldsMatch('Subjective', 'Subjective', 'Subjective')).toBe(true);
  });
});

describe('fieldsMatch does not spread a finding across similarly named fields', () => {
  it('a short generic section does not attach to every field containing that word', () => {
    // These all returned true under substring matching. "Assessment" landed on
    // two different fields at once, and "Status" on all twelve goal status
    // fields of a treatment plan.
    expect(fieldsMatch('Risk Assessment', 'Risk Assessment', 'Assessment')).toBe(false);
    expect(
      fieldsMatch(
        'Assessment & Therapeutic Intervention',
        'Assessment & Therapeutic Intervention',
        'Assessment',
      ),
    ).toBe(false);
    expect(fieldsMatch('Goal 1 Status', 'Goal 1 Status', 'Status')).toBe(false);
    expect(fieldsMatch('Goal 1 Long-Term Goal', 'Goal 1 Long-Term Goal', 'Goal')).toBe(false);
  });

  it('a longer section does not attach to a shorter field of the same family', () => {
    expect(fieldsMatch('Progress', 'Progress', 'Progress Overview')).toBe(false);
    expect(fieldsMatch('Progress Since Last Plan', 'Progress Since Last Plan', 'Progress')).toBe(false);
    expect(fieldsMatch('Objective', 'Objective', 'Short-Term Objective 1')).toBe(false);
  });

  it('a goal field only takes its own goal', () => {
    expect(fieldsMatch('Goal 1 Status', 'Goal 1 Status', 'Goal 1 Status')).toBe(true);
    expect(fieldsMatch('Goal 2 Status', 'Goal 2 Status', 'Goal 1 Status')).toBe(false);
  });

  it('an exact section still matches, punctuation and case aside', () => {
    expect(fieldsMatch('Progress Overview:', 'pqkf-1', 'Progress Overview')).toBe(true);
    expect(fieldsMatch('Subjective', '6tx9-1', 'SUBJECTIVE')).toBe(true);
    expect(fieldsMatch('Presenting Problem & Symptoms', 'h08z-1', 'Presenting Problem & Symptoms')).toBe(true);
  });

  it('a scorer name we know differs from ours is resolved by the alias table', () => {
    expect(fieldsMatch('Mental Status (optional)', 'cupi-1', 'Mental Status')).toBe(true);
    expect(
      fieldsMatch(
        'Assessment & Therapeutic Intervention',
        'nbli-1',
        'Assessment and Therapeutic Intervention',
      ),
    ).toBe(true);
  });

  it('a finding matches at most one displayed field', () => {
    // The property that matters. Anything it does not claim goes to the whole
    // note group, where it appears once.
    const fields = [
      'Assessment & Therapeutic Intervention',
      'Risk Assessment',
      'Progress',
      'Progress Since Last Plan',
      'Goal 1 Status',
      'Goal 2 Status',
    ];

    for (const target of ['Assessment', 'Progress', 'Status', 'Risk Assessment', 'Goal 2 Status']) {
      const hits = fields.filter(field => fieldsMatch(field, field, target));
      expect(hits.length).toBeLessThanOrEqual(1);
    }
  });
});

describe('patient identifiers are never displayed', () => {
  it('recognises the identifier fields whatever the punctuation or case', () => {
    for (const key of ['First Name:', 'first name', 'LAST NAME', 'Last Name:', 'Date of Birth:', 'date of birth']) {
      expect(isPatientIdentifierField(key)).toBe(true);
    }
  });

  it('does not treat clinical or clinician fields as patient identifiers', () => {
    for (const key of [
      'Presenting Problem & Symptoms',
      'Family History',
      'Full Name & Credentials (Signature)',
      'Therapist Initials',
      'Date Completed',
      'Initiation Date:',
      'Documented by Supervised Clinician (if applicable)',
    ]) {
      expect(isPatientIdentifierField(key)).toBe(false);
    }
  });

  it('hides name and date of birth on an intake note', () => {
    const keys = keysOf({
      'First Name:': 'Donnette',
      'Last Name:': 'Gooden',
      'Date of Birth:': '4/25/1995',
      'Presenting Problem & Symptoms': 'Reports low mood.',
      'Risk Assessment': 'No risk identified.',
      'Family History': 'Two siblings.',
    });

    expect(keys).not.toContain('First Name:');
    expect(keys).not.toContain('Last Name:');
    expect(keys).not.toContain('Date of Birth:');
    expect(keys).toContain('Presenting Problem & Symptoms');
  });

  it('hides them on a treatment plan too', () => {
    const keys = keysOf({
      'First Name:': 'Madison',
      'Last Name:': 'Traverso',
      'Date of Birth:': '7/8/1998',
      'Goal 1 Long-Term Goal': 'Reduce anxiety.',
      'Treatment Modality': 'Individual',
    });

    expect(keys).toEqual(['Goal 1 Long-Term Goal', 'Treatment Modality']);
  });

  it('leaves progress notes exactly as they were', () => {
    // These were already hidden, by the curated list rather than by this rule.
    const keys = keysOf({
      'First Name:': 'Alex',
      Subjective: 'Client presented calm.',
      Objective: 'Alert and oriented.',
      'Plan and Collaboration': 'Continue weekly.',
      'Therapist Initials': 'JD, LMHC',
    });

    expect(keys).toEqual(['Subjective', 'Objective', 'Plan and Collaboration', 'Therapist Initials']);
  });

  it('keeps the clinician signature, which is not patient information', () => {
    const keys = keysOf({
      'First Name:': 'Madison',
      'Full Name & Credentials (Signature)': 'Stacey A. Mohamed, LMHC-D',
      'Treatment Modality': 'Individual',
    });

    expect(keys).toContain('Full Name & Credentials (Signature)');
    expect(keys).not.toContain('First Name:');
  });
});
