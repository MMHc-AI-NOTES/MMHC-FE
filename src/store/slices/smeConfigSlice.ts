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

interface SMEConfigState {
  errorTypes: ErrorType[];
  issueRelatedTo: IssueRelatedTo[];
  issueDescriptions: IssueDescription[];
  errorTypesLoaded: boolean;
  issueRelatedToLoaded: boolean;
  issueDescriptionsLoaded: boolean;
}

const initialState: SMEConfigState = {
  errorTypes: [],
  issueRelatedTo: [],
  issueDescriptions: [],
  errorTypesLoaded: false,
  issueRelatedToLoaded: false,
  issueDescriptionsLoaded: false,
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
} = smeConfigSlice.actions;

export default smeConfigSlice.reducer;
