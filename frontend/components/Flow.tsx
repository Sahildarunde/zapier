import React, { useCallback, useRef, useState, useEffect } from 'react';
import axios from 'axios';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useDispatch, useSelector } from 'react-redux';
import { addNode, editNode } from '@/store/slices/zapSlice';
import { setSelectedNode } from '@/store/slices/selectedNodeSlice';



import { BACKEND_URL } from "@/app/config";
import { RootState } from '@/store';

const initialNodes = [
  {
    id: '0',
    type: 'input',
    data: { label: 'Trigger Node' }, // Initial trigger node
    position: { x: 0, y: 50 },
  },
];

let id = 1;
const getId = () => `${id++}`;
const verticalSpacing = 100; // Distance between nodes
const nodeOrigin = [0.5, 0];

function useAvailableActionsAndTriggers() {
  const [availableActions, setAvailableActions] = useState([]);
  const [availableTriggers, setAvailableTriggers] = useState([]);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/v1/trigger/available`)
      .then(response => setAvailableTriggers(response.data.availableTriggers));

    axios.get(`${BACKEND_URL}/api/v1/action/available`)
      .then(response => setAvailableActions(response.data.availableActions));
  }, []);

  return {
    availableActions,
    availableTriggers,
  };
}


const AddNodeOnEdgeDrop = () => {
  const reactFlowWrapper = useRef(null);
  const { availableActions, availableTriggers } = useAvailableActionsAndTriggers();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [lastNodePosition, setLastNodePosition] = useState({ x: 0, y: 50 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNodeThing, setSelectedNodeThing] = useState(null); // Store the currently selected node
  const dispatch = useDispatch();

  // Get nodes from store and check if "trigger" nodes exist
  // @ts-ignore
  const nodesStore = useSelector((state) => state.zapSlice.nodes);
  // @ts-ignore
  const hasTriggerNodes = nodesStore.some((node) => node.type === 'trigger');

  const onConnect = useCallback(
    // @ts-ignore
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  useEffect(() => {
    console.log('Updated nodes:', nodesStore); // Ensure nodes update on each change
  }, [nodesStore]);

  const onConnectEnd = useCallback(
    // @ts-ignore
    (event, connectionState) => {
      if (!connectionState.isValid) {
        const newNodeId = getId();

        dispatch(addNode({ 
          type: 'action', 
          actionType: "" , 
          details: {} 
        }));

        const newNodePosition = {
          x: lastNodePosition.x,
          y: lastNodePosition.y + verticalSpacing,
        };

        const newNode = {
          id: newNodeId,
          position: newNodePosition,
          type: 'action', // Ensure type is set here
          actionType: "", // Initialize actionType here if needed
          data: { label: `Action Node ${newNodeId}` },
          origin: nodeOrigin,
        };
        
        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({
            // @ts-ignore
            id: `e${connectionState.fromNode.id}-${newNodeId}`,
            source: connectionState.fromNode.id,
            target: newNodeId,
          })
        );

        setLastNodePosition(newNodePosition);
      }
    },
    [lastNodePosition, dispatch]
  );

  const selectedNodeStore = useSelector((state: RootState) => state.selectedNode?.selectedNode);

  // @ts-ignore
  const handleNodeClick = (event, node) => {
    setSelectedNodeThing(node);
    console.log("Node Clicked:", node);
  
    dispatch(setSelectedNode({
      id: node.id,
      type:  node.type || "action",
      actionType: node.actionType ||"defaultAction",
      details: node.details || {}
    }));
    setIsModalOpen(true);
  };

  const handleModalSelect = (item: string) => {
    console.log(item);
    
    dispatch(editNode({ 
      // @ts-ignore
      id: selectedNodeThing?.id,
      item: item, 
      updatedDetails: {} 
    }));

    if (selectedNodeThing) {
      setNodes((nds) =>
        // @ts-ignore
        nds.map((n) => (n.id === selectedNodeThing.id ? { ...n, data: { ...n.data, label: item } } : n))
      );
    }

    if(!selectedNodeStore) return;

    dispatch(setSelectedNode({
      id: selectedNodeStore?.id,
      type: selectedNodeStore.type,
      actionType: item,
      details: {}
    }));
  };

  // @ts-ignore
  const renderNodeContent = (node) => (
    <div className="node-content">
      <button
        className="open-modal-button"
        onClick={(event) => {
          event.stopPropagation();
          handleNodeClick(event, node);
        }}
      >
        Open Modal
      </button>
    </div>
  );

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={hasTriggerNodes ? nodes : initialNodes} // Render only nodes if trigger exists
        edges={edges}
        onConnectEnd={onConnectEnd} 
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 2 }}
        // @ts-ignore
        nodeOrigin={nodeOrigin}
        onNodeClick={handleNodeClick}
      >
        <Background />
      </ReactFlow>

      <ItemSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleModalSelect}
        items={
          // @ts-ignore
          selectedNodeThing && nodes.find(n => n.id === selectedNodeThing.id).id === '0' ? availableTriggers : availableActions}
      />
    </div>
  );
};


// const AddNodeOnEdgeDrop = () => {
//   const reactFlowWrapper = useRef(null);
//   const { availableActions, availableTriggers } = useAvailableActionsAndTriggers();
//   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const { screenToFlowPosition } = useReactFlow();
//   const [lastNodePosition, setLastNodePosition] = useState({ x: 0, y: 50 });
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedNodeThing, setSelectedNodeThing] = useState(null); // Store the currently selected node
//   const dispatch = useDispatch();

//   // @ts-ignore
//   const nodesStore = useSelector((state) => state.zapSlice.nodes);

//   const onConnect = useCallback(
//     // @ts-ignore
//     (params) => setEdges((eds) => addEdge(params, eds)),
//     []
//   );

//   useEffect(() => {
//     console.log('Updated nodes:', nodesStore); // Ensure nodes update on each change
//   }, [nodesStore]);

//   const onConnectEnd = useCallback(
//     // @ts-ignore
//     (event, connectionState) => {
//       if (!connectionState.isValid) {
//         const newNodeId = getId();

//         dispatch(addNode({ 
//           type: 'action', 
//           actionType: "" , 
//           details: {} 
//         }));

//         const newNodePosition = {
//           x: lastNodePosition.x,
//           y: lastNodePosition.y + verticalSpacing,
//         };

//         const newNode = {
//           id: newNodeId,
//           position: newNodePosition,
//           type: 'action', // Ensure type is set here
//           actionType: "", // Initialize actionType here if needed
//           data: { label: `Action Node ${newNodeId}` },
//           origin: nodeOrigin,
//         };
        

//         // @ts-ignore
//         setNodes((nds) => nds.concat(newNode));
//         setEdges((eds) =>
//           eds.concat({
//             // @ts-ignore
//             id: `e${connectionState.fromNode.id}-${newNodeId}`,
//             source: connectionState.fromNode.id,
//             target: newNodeId,
//           })
//         );

//         setLastNodePosition(newNodePosition);
//       }
//     },
//     [lastNodePosition, dispatch]
//   );

//   const selectedNodeStore = useSelector((state: RootState) => state.selectedNode?.selectedNode);

//   // @ts-ignore
//   const handleNodeClick = (event, node) => {
//     setSelectedNodeThing(node);
//     console.log("Node Clicked:", node);
  
//     // Dispatch only if type and actionType are defined, or handle the undefined case
//     dispatch(setSelectedNode({
//       id: node.id,
//       type:  node.type || "action",  // Fallback value if undefined
//       actionType: node.actionType ||"defaultAction", // Fallback value
//       details: node.details || {} // Add empty object if details is undefined
//     }));
//     setIsModalOpen(true);
//   };


 

//   // @ts-ignore
//   const handleModalSelect = (item: string) => {

//     console.log(item);
    

//     dispatch(editNode({ 
//       //  @ts-ignore
//       id: selectedNodeThing?.id,
//       item: item, // Assuming item is already a string, pass it directly
//       updatedDetails: {} 
//     }));

    
    

//     if (selectedNodeThing) {
//       setNodes((nds) =>
//         // @ts-ignore
//         nds.map((n) => (n.id === selectedNodeThing.id ? { ...n, data: { ...n.data, label: item } } : n))
        
//       );
//     }

   

//     if(!selectedNodeStore) return;

//     dispatch(setSelectedNode({
//       id: selectedNodeStore?.id,// Fallback value if undefinedle
//       type: selectedNodeStore.type,
//       actionType: item, // Fallback value
//       details: {} // Add empty object if details is undefined
//     }));
//   };

//   const renderNodeContent = (node: any) => (
//     <div className="node-content">
//       <button
//         className="open-modal-button"
//         onClick={(event) => {
//           event.stopPropagation(); // Prevents node click event from firing
//           handleNodeClick(event, node);
//         }}
//       >
//         Open Modal
//       </button>
//       {/* Rest of the node content */}
//     </div>
//   );

//   return (
//     <div className="h-full w-full" ref={reactFlowWrapper}>
//       <ReactFlow
//         nodes={nodes}
//         edges={edges}
//         onConnectEnd={onConnectEnd} 
//         onNodesChange={onNodesChange}
//         onEdgesChange={onEdgesChange}
//         onConnect={onConnect}
//         fitView
//         fitViewOptions={{ padding: 2 }}
//         // @ts-ignore
//         nodeOrigin={nodeOrigin}
//         onNodeClick={handleNodeClick}
//       >
//         <Background />
//       </ReactFlow>

//       <ItemSelectionModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSelect={handleModalSelect}
//         // @ts-ignore
//         items={selectedNodeThing && nodes.find(n => n.id === selectedNodeThing.id).id === '0' ? availableTriggers : availableActions} // Conditional check for trigger or action
//       />
//     </div>
//   );
// };

export default function Flow() {
  return (

      <ReactFlowProvider>
        <AddNodeOnEdgeDrop />
      </ReactFlowProvider>
  );
}

// @ts-ignore
const ItemSelectionModal = ({ isOpen, onClose, onSelect, items }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '300px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <h3>Select an Item</h3>
        {
        // @ts-ignore
        items.map((item) => (
          <div key={item.id} style={{ margin: '10px 0' }}>
            <button
              onClick={() => {
                onSelect(item.name); // Change here to select the name
                onClose();
              }}
              style={{
                padding: '5px 10px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#007bff',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              {item.name} {/* Change here to render the name instead of the object */}
            </button>
          </div>
        ))}
        <button
          onClick={onClose}
          style={{
            padding: '5px 10px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: 'lightgray',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
