
import React, { useCallback, useRef, useState, useEffect } from 'react';
import axios from 'axios';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useDispatch, useSelector } from 'react-redux';
import {addNode, editNode} from '@/store/slices/zapSlice';
import { setSelectedNode } from '@/store/slices/selectedNodeSlice';



import { BACKEND_URL } from "@/app/config";
import { RootState } from '@/store';
import { useParams } from 'next/navigation';
import { loadZap } from '@/store/slices/asyncThunk';




let ids = 1;
const getId = () => `${ids++}`;
const verticalSpacing = 100; // Distance between nodes
const nodeOrigin = [0.5, 0];


const initialNodes = [
  {
    id: ids,
    type: {
      id: "webhook",
      name: "Webhook",
      image: ""
    }, // Ensure type is defined
    metadata: {},
    data: { label: 'Trigger Node' },
    actionType: "",
    position: { x: 0, y: 50 },
    origin: nodeOrigin,
  },
];

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
  const nodesStore = useSelector((state: RootState) => state.zapSlice.nodes);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [lastNodePosition, setLastNodePosition] = useState({ x: 0, y: 50 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNodeThing, setSelectedNodeThing] = useState(null); // Store the currently selected node
  const dispatch = useDispatch();


  const onConnect = useCallback(
    // @ts-expect-error: This can throw error
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );


  const {id} = useParams();
 
  useEffect(() => {
    // @ts-expect-error: This can throw error
    dispatch(loadZap(id)); // Load the nodes based on the ID
  }, [id])

  
  useEffect(() => {
    
    console.log("my nodesote : " + JSON.stringify(nodesStore))
    if (nodesStore && nodesStore.length > 0) {
      // Load nodes from nodesStore if it has data
      let currentPosition = { x: 0, y: 50 }; 
      let currentNodeId = '0'; 
      
      const newNodes = nodesStore.map((node) => {
        const tempNode = node;
        const newNode = {
          ...node,
          id: currentNodeId,
          position: currentPosition,
          actionType: tempNode.type?.name,
          data: { label: tempNode.type?.name },
          origin: nodeOrigin,
        };
  
        currentNodeId = `${parseInt(currentNodeId) + 1}`;
        currentPosition = { x: currentPosition.x, y: currentPosition.y + verticalSpacing };
        return newNode;
      });
      // @ts-expect-error: This can throw error
      setNodes(newNodes); // Update nodes based on nodesStore
  
      // Generate edges
      const newEdges = newNodes.slice(0, -1).map((node, i) => ({
        id: `e${node.id}-${newNodes[i + 1].id}`,
        source: node.id,
        target: newNodes[i + 1].id,
      })); // @ts-expect-error: This can throw error
      setEdges(newEdges);
  
    } else {
      console.log('Nodes store is empty, initializing with default node');
      // Initialize from scratch if nodesStore is empty 
      // @ts-expect-error: This can throw error
      setNodes(initialNodes); // Set initial node if there's no data
      setEdges([]); // Clear edges
    }
  },[nodesStore]);
  
  // Render component remains the same...
  
  

  const onConnectEnd = useCallback(
   // @ts-expect-error: This can throw error
    (event, connectionState) => {
      if (!connectionState.isValid) {
        const newNodeId = getId();

        console.log("this is my newNodeId : " +newNodeId)

        dispatch(addNode({ 
          id: newNodeId,
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
        
        // @ts-expect-error: This can throw error
        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({
            // @ts-expect-error: This can throw error
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

 // @ts-expect-error: This can throw error
  const handleNodeClick = (event, node) => {
    setSelectedNodeThing(node);
    console.log("Node Clicked:", node);
  
    dispatch(setSelectedNode({
      id: node.id,
      type:  node.type || "bicto",
      actionType: node.actionType ||"defaultAction",
      details: node.details || {}
    }));
    setIsModalOpen(true);
  };

  const handleModalSelect = (item: string) => {

    console.log("itme got "+ item)
    
    const payload = {
      // @ts-expect-error: This can throw error
      id: (selectedNodeThing?.id),
      item: item,
      type: {
        id: item === 'Webhook' ? 'webhook' : 'email',
        name: item
      },
      actionType: item,
      data: { label: item },
      updatedDetails: {}
    };
    
    console.log("Dispatch payload:", payload); // Ensure 'type' is included in the logged payload
    dispatch(editNode(payload));
    

    if(!selectedNodeStore) return;

    dispatch(setSelectedNode({
      id: selectedNodeStore?.id,
      type: selectedNodeStore.type,
      actionType: item,
      details: {}
    }));

    if (selectedNodeThing) {
     // @ts-expect-error: This can throw error
      setNodes((nds) =>
        // @ts-expect-error: This can throw error
        nds.map((n) => (n.id === selectedNodeThing.id ? { ...n, data: { ...n.data, label: item }, actionType: item } : n))
      );
    }

    
  };


  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
      nodes={nodes}
      // Render only nodes if trigger exists
        edges={edges}
        onConnectEnd={onConnectEnd} 
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 2 }}
        // @ts-expect-error: This can throw error
        nodeOrigin={nodeOrigin}
        onNodeClick={handleNodeClick}
      >
        <Background />
      </ReactFlow>

      <ItemSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleModalSelect}
        // @ts-expect-error: This can throw error
        items={selectedNodeThing && nodes.find(n => n.id === selectedNodeThing.id).id === '0' ? availableTriggers : availableActions}
      />
    </div>
  );
};


export default function Flow() {
  return (

      <ReactFlowProvider>
        <AddNodeOnEdgeDrop />
      </ReactFlowProvider>
  );
}

// @ts-expect-error: This can throw error
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
          // @ts-expect-error: This can throw error
          items?.map((item) => (
            <div key={item.id} style={{ margin: '10px 0' }}>
              <button
                onClick={() => {
                  onSelect(item.name); // Make sure `item.name` is a valid string
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
                {item.name} {/* Ensure `item.name` is a valid string */}
              </button>
            </div>
          ))
        }
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
