
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RecordState {
    RecordState: JSON | null;
}

const initialState: RecordState = {
    RecordState: null,
};

export const RecordNodeSlice = createSlice({
  name: 'RecordState',
  initialState,
  reducers: {
    setRecordNode: (state, action: PayloadAction<RecordState['RecordState']>) => {
        
      state.RecordState = action.payload;
      console.log(action.payload);
    },
    clearRecordNode: (state) => {
      state.RecordState = null;
    },
  },
});

export const { setRecordNode, clearRecordNode } = RecordNodeSlice.actions;
export default RecordNodeSlice.reducer;
