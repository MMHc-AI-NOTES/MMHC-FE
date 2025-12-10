// store/slices/filterOptionsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PractitionerOption, CptCodeOption, ReviewerOption } from '@/types/notes';

interface FilterOptionsState {
  practitioners: PractitionerOption[];
  cptCodes: CptCodeOption[];
  reviewers: ReviewerOption[];
  practitionersLoaded: boolean;
  cptCodesLoaded: boolean;
  reviewersLoaded: boolean;
}

const initialState: FilterOptionsState = {
  practitioners: [],
  cptCodes: [],
  reviewers: [],
  practitionersLoaded: false,
  cptCodesLoaded: false,
  reviewersLoaded: false,
};

const filterOptionsSlice = createSlice({
  name: 'filterOptions',
  initialState,
  reducers: {
    setPractitioners: (state, action: PayloadAction<PractitionerOption[]>) => {
      state.practitioners = action.payload;
      state.practitionersLoaded = true;
    },
    setCptCodes: (state, action: PayloadAction<CptCodeOption[]>) => {
      state.cptCodes = action.payload;
      state.cptCodesLoaded = true;
    },
    setReviewers: (state, action: PayloadAction<ReviewerOption[]>) => {
      state.reviewers = action.payload;
      state.reviewersLoaded = true;
    },
    clearFilterOptions: state => {
      state.practitioners = [];
      state.cptCodes = [];
      state.reviewers = [];
      state.practitionersLoaded = false;
      state.cptCodesLoaded = false;
      state.reviewersLoaded = false;
    },
  },
});

export const { setPractitioners, setCptCodes, setReviewers, clearFilterOptions } = filterOptionsSlice.actions;
export default filterOptionsSlice.reducer;
