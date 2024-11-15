import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  nodes : [
    {
      id: '0',
      type: {
        id: "webhook",
        name: "Webhook",
        image: ""
      }, // Ensure type is defined
      style: {
        backgroundColor: "#fff",
        color: "#333",
      },
      metadata: {},
      data: { label: 'Trigger Node' },
      actionType: "",
      position: { x: 0, y: 50 },
    },
  ]
};

let nextId = 1;

export const zapSlice = createSlice({
  name: 'zapSlice',
  initialState,
  reducers: {
    // setNodesInit: (state, action) => {
    //   if(state.nodes?.length === 0) {
    //     return state;
    //   };
    //   state.nodes = action.payload; // This will update the nodes state with the new array
    // },
    addNode: (state, action) => {
      const newNode = {
        id: `${nextId++}`,
        type: {
          id: action.payload.id,
          name: action.payload.name,
          image: ''
        },
        actionType: action.payload.actionType,
        data: {label: action.payload.actionType},
        details: action.payload.details || {},
        position: { x: 0, y: state.nodes.length * 100 } // Assign a default position here
      }; // @ts-ignore
      state.nodes.push(newNode);
      console.log("hi i reached here");
      console.log(newNode);
    },    
    editNode: (state, action) => {
      const { id, updatedDetails, item, style } = action.payload;

      console.log("ye hai type of id: " + typeof(id));
    
      console.log("ye hai updartedDetals: " + JSON.stringify(updatedDetails)); // Log the entire payload to see if `type` is present
      
      if (state.nodes.length === 0) {
        console.log("reached the state");
        return state;
      }

      state.nodes = state.nodes.map((node) => {
        console.log("ye hai mere states : "+JSON.stringify(node))
        // @ts-ignore
        if (node.id == (id)) {
          return {
            ...node,
            actionType: item,
            data: {
              ...node.data,
              label: item,
            },
            type: {
              ...node.type,
              id: item === "Webhook" ? "webhook" : "email",
              name: item
            },  // Here, you use 'type' from the payload
            style: {
              ...node.style,
              ...style
            },
            metadata: {
              ...node.metadata,
              ...updatedDetails,
            },
          };
        }
    
        return node; // Return other nodes unchanged
      });


    },      
    deleteNode: (state, action) => {
      const { id } = action.payload;
      state.nodes = state.nodes.filter((node) => node.id !== id);
    },
    initializeZap: (state, action) => {

      if(JSON.stringify(action.payload) === JSON.stringify({"nodes":[null]})) {
        console.log("this is mu state : " +JSON.stringify(state))
        return state = initialState;
      };

      // @ts-ignore
      state.nodes = (action.payload.nodes).map((node, index) => ({
        ...node,
        // Only set position if nodesStore is not empty
        id: index,
        style: {
          backgroundColor: "#fff",
          color: "#333",
        }
        // position: action.payload.nodes && action.payload.nodes.length > 0 
        //   ? { x: 0, y: index * 100 } 
        //   : node.position,

      }));
      
      // Update nextId to avoid duplicate IDs, only if nodes are present
      nextId = state.nodes.length ? Math.max(...state.nodes.map(node => parseInt(node.id))) + 1 : 1;      
    }
  },
});

export const { addNode, editNode, deleteNode, initializeZap } = zapSlice.actions;
export default zapSlice.reducer;