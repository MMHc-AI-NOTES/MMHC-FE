// store/slices/filterOptionsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PractitionerOption, CptCodeOption } from '@/types/notes';

interface FilterOptionsState {
  practitioners: PractitionerOption[];
  cptCodes: CptCodeOption[];
  practitionersLoaded: boolean;
  cptCodesLoaded: boolean;
}

const initialState: FilterOptionsState = {
  practitioners: [],
  cptCodes: [],
  practitionersLoaded: false,
  cptCodesLoaded: false,
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
    clearFilterOptions: state => {
      state.practitioners = [];
      state.cptCodes = [];
      state.practitionersLoaded = false;
      state.cptCodesLoaded = false;
    },
  },
});

export const { setPractitioners, setCptCodes, clearFilterOptions } = filterOptionsSlice.actions;
export default filterOptionsSlice.reducer;
