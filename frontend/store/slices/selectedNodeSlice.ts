// store/slices/selectedNodeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectedNodeState {
  selectedNode: {
    id: string;
    type: string;
    actionType: string;
    details: object;
  } | null;
}

const initialState: SelectedNodeState = {
  selectedNode: null,
};

export const selectedNodeSlice = createSlice({
  name: 'selectedNode',
  initialState,
  reducers: {
    setSelectedNode: (state, action: PayloadAction<SelectedNodeState['selectedNode']>) => {
        
      state.selectedNode = action.payload;
    },
    clearSelectedNode: (state) => {
      state.selectedNode = null;
    },
  },
});

export const { setSelectedNode, clearSelectedNode } = selectedNodeSlice.actions;
export default selectedNodeSlice.reducer;
