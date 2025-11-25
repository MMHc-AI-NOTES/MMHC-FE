// @/types/notes.ts
export interface RawApiNote {
  id: number;
  noteId: string;
  sessionId: string;
  sessionTime: string;
  practitionerId: number;
  createdAt: string;
  updatedAt: string;
  practitioner: {
    id: number;
    fullName: string;
    email: string;
    type: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface FormattedNote {
  id: string;
  practitioner: string;
  sessionTime: string;
  rawData?: RawApiNote;
}

export interface DataFormatterProps {
  data: RawApiNote[];
}

export interface NoteDetail {
  id: string;
  date: string;
  practitioner: string;
  cptCode: string;
  noteType: string;
  aiReviews: number;
  auditScore: number;
  lastRun: string;
  summary: string;
  issues: {
    severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
    category: string;
    points: number;
    description: string;
    sectionId: string;
  }[];
}

export interface NoteSection {
  id: string;
  title: string;
  code: string;
  icon: any;
  content: string;
  highlight?: boolean;
}
