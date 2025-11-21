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
