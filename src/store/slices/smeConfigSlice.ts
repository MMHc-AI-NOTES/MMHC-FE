import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Error Type interfaces
export interface ErrorType {
  id?: number;
  name: string;
  displayName: string;
  points: number;
  value?: string; // For backward compatibility
  label?: string; // For backward compatibility
}

// Issue Related To interfaces
export interface IssueRelatedTo {
  id?: number;
  fieldId: string;
  displayName: string;
}

// Issue Description interfaces
export interface IssueDescription {
  id?: number;
  key: string;
  description: string;
}

// SME Template (Description Mapping)
export interface SMETemplate {
  id: number;
  error_type_id: number;
  issues_related_to_id: number;
  issue_description_id: number;
  description_id?: string | null;
}

interface SMEConfigState {
  errorTypes: ErrorType[];
  issueRelatedTo: IssueRelatedTo[];
  issueDescriptions: IssueDescription[];
  smeTemplates: SMETemplate[];
  errorTypesLoaded: boolean;
  issueRelatedToLoaded: boolean;
  issueDescriptionsLoaded: boolean;
  smeTemplatesLoaded: boolean;
}

const initialState: SMEConfigState = {
  errorTypes: [],
  issueRelatedTo: [],
  issueDescriptions: [],
  smeTemplates: [],
  errorTypesLoaded: false,
  issueRelatedToLoaded: false,
  issueDescriptionsLoaded: false,
  smeTemplatesLoaded: false,
};

const smeConfigSlice = createSlice({
  name: 'smeConfig',
  initialState,
  reducers: {
    // Error Types
    setErrorTypes: (state, action: PayloadAction<ErrorType[]>) => {
      state.errorTypes = action.payload;
      state.errorTypesLoaded = true;
    },
    addErrorType: (state, action: PayloadAction<ErrorType>) => {
      state.errorTypes.push(action.payload);
    },
    updateErrorType: (state, action: PayloadAction<ErrorType>) => {
      const index = state.errorTypes.findIndex(et => et.id === action.payload.id);
      if (index !== -1) {
        state.errorTypes[index] = action.payload;
      }
    },
    deleteErrorType: (state, action: PayloadAction<number>) => {
      state.errorTypes = state.errorTypes.filter(et => et.id !== action.payload);
    },

    // Issue Related To
    setIssueRelatedTo: (state, action: PayloadAction<IssueRelatedTo[]>) => {
      state.issueRelatedTo = action.payload;
      state.issueRelatedToLoaded = true;
    },
    addIssueRelatedTo: (state, action: PayloadAction<IssueRelatedTo>) => {
      state.issueRelatedTo.push(action.payload);
    },
    updateIssueRelatedTo: (state, action: PayloadAction<IssueRelatedTo>) => {
      const index = state.issueRelatedTo.findIndex(irt => irt.id === action.payload.id);
      if (index !== -1) {
        state.issueRelatedTo[index] = action.payload;
      }
    },
    deleteIssueRelatedTo: (state, action: PayloadAction<number>) => {
      state.issueRelatedTo = state.issueRelatedTo.filter(irt => irt.id !== action.payload);
    },

    // Issue Descriptions
    setIssueDescriptions: (state, action: PayloadAction<IssueDescription[]>) => {
      state.issueDescriptions = action.payload;
      state.issueDescriptionsLoaded = true;
    },
    addIssueDescription: (state, action: PayloadAction<IssueDescription>) => {
      state.issueDescriptions.push(action.payload);
    },
    updateIssueDescription: (state, action: PayloadAction<IssueDescription>) => {
      const index = state.issueDescriptions.findIndex(id => id.id === action.payload.id);
      if (index !== -1) {
        state.issueDescriptions[index] = action.payload;
      }
    },
    deleteIssueDescription: (state, action: PayloadAction<number>) => {
      state.issueDescriptions = state.issueDescriptions.filter(id => id.id !== action.payload);
    },

    // SME Templates (Description Mapping)
    setSMETemplates: (state, action: PayloadAction<SMETemplate[]>) => {
      state.smeTemplates = action.payload;
      state.smeTemplatesLoaded = true;
    },
    addSMETemplate: (state, action: PayloadAction<SMETemplate>) => {
      state.smeTemplates.push(action.payload);
    },
    updateSMETemplate: (state, action: PayloadAction<SMETemplate>) => {
      const index = state.smeTemplates.findIndex(t => t.id === action.payload.id);
      if (index !== -1) state.smeTemplates[index] = action.payload;
    },
    deleteSMETemplate: (state, action: PayloadAction<number>) => {
      state.smeTemplates = state.smeTemplates.filter(t => t.id !== action.payload);
    },
  },
});

export const {
  setErrorTypes,
  addErrorType,
  updateErrorType,
  deleteErrorType,
  setIssueRelatedTo,
  addIssueRelatedTo,
  updateIssueRelatedTo,
  deleteIssueRelatedTo,
  setIssueDescriptions,
  addIssueDescription,
  updateIssueDescription,
  deleteIssueDescription,
  setSMETemplates,
  addSMETemplate,
  updateSMETemplate,
  deleteSMETemplate: deleteSMETemplateSlice,
} = smeConfigSlice.actions;

export default smeConfigSlice.reducer;
