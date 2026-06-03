import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SelectedClientState {
  selectedClientId: string | null;
}

const initialState: SelectedClientState = {
  selectedClientId: null,
};

const selectedClientSlice = createSlice({
  name: 'selectedClient',
  initialState,
  reducers: {
    setSelectedClientId: (state, action: PayloadAction<string>) => {
      state.selectedClientId = action.payload;
    },
    clearSelectedClientId: state => {
      state.selectedClientId = null;
    },
  },
});

export const { setSelectedClientId, clearSelectedClientId } = selectedClientSlice.actions;
export default selectedClientSlice.reducer;
