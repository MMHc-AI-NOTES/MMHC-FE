// Dummy API layer for Manager Review flow. Replace with real endpoints later.

import { DisagreementLevelEnum, ManagerDecisionEnum, PriorityEnum } from '@/constants/common';
import { ManagerNote, ManagerNoteDetail, ManagerOverview } from './managerReviewTypes';

const dummyNotes: ManagerNote[] = [
  {
    id: '12439',
    practitioner: 'Jane Thompson',
    date: 'Feb 9, 2025',
    aiScore: 82,
    humanScore: 88,
    reviewer: 'J. Turner',
    humanDecision: ManagerDecisionEnum.approve_with_edits,
    disagreement: DisagreementLevelEnum.high,
    priority: PriorityEnum.high,
    action: 'Review',
  },
  {
    id: '12441',
    practitioner: 'Michael Chen',
    date: 'Feb 9, 2025',
    aiScore: 58,
    humanScore: 75,
    reviewer: 'S. Martinez',
    humanDecision: ManagerDecisionEnum.return_to_practitioner,
    disagreement: DisagreementLevelEnum.low,
    priority: PriorityEnum.high,
    action: 'Review',
  },
  {
    id: '12443',
    practitioner: 'Sarah Williams',
    date: 'Feb 8, 2025',
    aiScore: 75,
    humanScore: 80,
    reviewer: 'J. Turner',
    humanDecision: ManagerDecisionEnum.approve_with_edits,
    disagreement: DisagreementLevelEnum.low,
    priority: PriorityEnum.medium,
    action: 'Review',
  },
  {
    id: '12445',
    practitioner: 'David Rodriguez',
    date: 'Feb 8, 2025',
    aiScore: 62,
    humanScore: 70,
    reviewer: 'S. Martinez',
    humanDecision: ManagerDecisionEnum.return_to_practitioner,
    disagreement: DisagreementLevelEnum.medium,
    priority: PriorityEnum.high,
    action: 'Review',
  },
  {
    id: '12447',
    practitioner: 'Emily Johnson',
    date: 'Feb 7, 2025',
    aiScore: 78,
    humanScore: 85,
    reviewer: 'J. Turner',
    humanDecision: ManagerDecisionEnum.approve_with_edits,
    disagreement: DisagreementLevelEnum.low,
    priority: PriorityEnum.low,
    action: 'Review',
  },
  {
    id: '12449',
    practitioner: 'Robert Lee',
    date: 'Feb 7, 2025',
    aiScore: 55,
    humanScore: null,
    reviewer: 'S. Martinez',
    humanDecision: ManagerDecisionEnum.escalate,
    disagreement: DisagreementLevelEnum.none,
    priority: PriorityEnum.high,
    action: 'Review',
  },
  {
    id: '12451',
    practitioner: 'Amanda Foster',
    date: 'Feb 6, 2025',
    aiScore: 73,
    humanScore: 78,
    reviewer: 'J. Turner',
    humanDecision: ManagerDecisionEnum.approve_with_edits,
    disagreement: DisagreementLevelEnum.low,
    priority: PriorityEnum.medium,
    action: 'Review',
  },
  {
    id: '12453',
    practitioner: 'Chris Anderson',
    date: 'Feb 6, 2025',
    aiScore: 68,
    humanScore: 82,
    reviewer: 'S. Martinez',
    humanDecision: ManagerDecisionEnum.approve_with_edits,
    disagreement: DisagreementLevelEnum.medium,
    priority: PriorityEnum.low,
    action: 'Review',
  },
];

const dummyOverview: ManagerOverview = {
  totalPending: 8,
  highDisagreements: 1,
  avgReviewTime: '12.3 min',
  agreementRate: 76,
  decisionBreakdown: {
    approveWithEdits: 5,
    returnToPractitioner: 2,
    escalate: 1,
  },
};

const dummyDetail: ManagerNoteDetail = {
  id: '12439',
  practitioner: 'Jane Thompson',
  date: 'Feb 9, 2025',
  cptCode: '90791',
  noteType: 'Progress Note',
  aiScore: 82,
  aiConfidence: 87,
  aiStatus: 'Needs Correction',
  humanScore: 78,
  humanDecision: 'Escalated to Manager',
  reviewer: 'J. Turner',
  reviewAttempts: 1,
  aiSummary:
    'This progress note demonstrates adequate clinical documentation with appropriate coverage of therapeutic interventions and patient response. However, several areas require attention to meet full compliance standards.',
  statusTags: ['Pending Manager Review', 'Practitioner Disputed', 'Awaiting SME Review'],
  humanReviewStatus: 'Escalated',
  issues: [
    {
      severity: 'Critical',
      category: 'Assessment & Therapeutic Intervention',
      description:
        'Missing specific DSM-5 diagnostic criteria documentation. Clinical assessment lacks measurable symptoms or severity indicators required for medical necessity.',
      points: -25,
    },
    {
      severity: 'Moderate',
      category: 'Plan & Collaboration',
      description:
        'Treatment plan lacks specific, measurable goals. Coordination with psychiatrist mentioned but no documentation of actual communication or consent for information sharing.',
      points: -10,
    },
    {
      severity: 'Minor',
      category: 'Subjective',
      description:
        'Could benefit from more specific timeline documentation (e.g., exact duration and frequency of symptoms). Current documentation meets minimum requirements.',
      points: -5,
    },
  ],
  subjective:
    'Patient reports feeling increased anxiety over the past week, particularly related to work deadlines. States difficulty sleeping and increased irritability. Denies suicidal ideation or intent. Reports medication compliance with current regimen.',
};

export const fetchManagerNotes = (filters?: Partial<ManagerNote> & { search?: string }): Promise<ManagerNote[]> =>
  new Promise(resolve => {
    setTimeout(() => {
      if (!filters) {
        resolve(dummyNotes);
        return;
      }

      const filtered = dummyNotes.filter(note => {
        const matchesDecision = filters.humanDecision ? note.humanDecision === filters.humanDecision : true;
        const matchesPriority = filters.priority ? note.priority === filters.priority : true;
        const matchesDisagreement = filters.disagreement ? note.disagreement === filters.disagreement : true;
        const matchesSearch = filters.search
          ? note.id.includes(filters.search) ||
            note.practitioner.toLowerCase().includes(filters.search.toLowerCase()) ||
            note.reviewer.toLowerCase().includes(filters.search.toLowerCase())
          : true;

        return matchesDecision && matchesPriority && matchesDisagreement && matchesSearch;
      });

      resolve(filtered);
    }, 300);
  });

export const fetchManagerOverview = (): Promise<ManagerOverview> =>
  new Promise(resolve => {
    setTimeout(() => resolve(dummyOverview), 200);
  });

export const fetchManagerNoteDetail = (id: string): Promise<ManagerNoteDetail> =>
  new Promise(resolve => {
    setTimeout(() => resolve({ ...dummyDetail, id }), 200);
  });
