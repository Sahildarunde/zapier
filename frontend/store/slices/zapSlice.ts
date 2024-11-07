import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  nodes: [
    {
      id: '0',
      type: 'trigger',
      actionType: 'webhook',
      details: {}
    }
  ],
};

let nextId = 1;

export const zapSlice = createSlice({
  name: 'zapSlice',
  initialState,
  reducers: {
    addNode: (state, action) => {
      const newNode = {
        id: `${nextId++}`,
        type: action.payload.type,
        actionType: action.payload.actionType,
        details: action.payload.details || {},
      };
      state.nodes.push(newNode);
      console.log("hi i reached here")
      console.log(newNode)
    },
    editNode: (state, action) => {
      const { id, updatedDetails, item } = action.payload;
      const node = state.nodes.find(node => node.id === id);
      console.log("hi i reached here")
      if (node) {
        node.actionType = item; // Assign item directly to actionType
        node.details = { ...node.details, ...updatedDetails };
        console.log(node);
      }



      state.nodes.map(node => console.log(node.actionType))
      console.log(state.nodes.length)
      console.log(node)
      
    },    
    deleteNode: (state, action) => {
      const { id } = action.payload;
      state.nodes = state.nodes.filter((node) => node.id !== id);
    },
  },
});

export const { addNode, editNode, deleteNode } = zapSlice.actions;
export default zapSlice.reducer;
