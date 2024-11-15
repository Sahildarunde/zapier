"use client"

import React, { useCallback } from 'react';
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Appbar from '@/components/Appbar';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
 

 
const Page = () => { 
  const theme = useSelector((state: RootState) => state.theme.theme)

  const initialNodes = [
    {
      id: 'horizontal-1',
      sourcePosition: 'right',
      targetPosition: 'left',
      data: { 
        label: 'Zapier Frontend Triggers: "webhook", Actions: Email[]',
      },
      position: { x: 300, y: 0 },
      style: {
        backgroundColor: theme === 'dark' ? '#444' : '#fff', // Update based on theme
        color: theme === 'dark' ? '#fff' : '#333', // Update text color based on theme
        height: "100px",
        border: '1px solid black',
      },
    },
    {
      id: 'horizontal-2',
      targetPosition: 'left',
      data: { label: 'Zapier Backend   api.zapier.com/' },
      style: {
        backgroundColor: theme === 'dark' ? '#444' : '#fff', // Update based on theme
        color: theme === 'dark' ? '#fff' : '#333', // Update text color based on theme
        height: "100px",
        border: '1px solid black',
      },
      position: { x: 600, y: 0 },
    },
    {
      id: 'horizontal-3',
      sourcePosition: 'right',
      data: { label: 'hooks.zapier.com/' },
      style: {
        backgroundColor: theme === 'dark' ? '#444' : '#fff', // Update based on theme
        color: theme === 'dark' ? '#fff' : '#333', // Update text color based on theme
        height: "100px",
        border: '1px solid black',
      },
      position: { x: 300, y: 150 },
    },
    {
      id: 'horizontal-4',
      sourcePosition: 'right',
      targetPosition: 'left',
      data: { label: 'database neonDB Triggers and Actions' },
      
      style: {
        backgroundColor: theme === 'dark' ? '#444' : '#fff', // Update based on theme
        color: theme === 'dark' ? '#fff' : '#333', // Update text color based on theme
        height: "50px",
        border: '1px solid black',
      },
      position: { x: 500, y: 130 },
    },
    {
      id: 'horizontal-5',
      sourcePosition: 'right',
      targetPosition: 'top',
      data: { label: 'Redis' },
      style: {
        backgroundColor: theme === 'dark' ? '#444' : '#fff', // Update based on theme
        color: theme === 'dark' ? '#fff' : '#333', // Update text color based on theme
        height: "50px",
        border: '1px solid black',
      },
      position: { x: 500, y: 230 },
    },
    {
      id: 'horizontal-6',
      sourcePosition: 'bottom',
      targetPosition: 'left',
      style: {
        backgroundColor: theme === 'dark' ? '#444' : '#fff', // Update based on theme
        color: theme === 'dark' ? '#fff' : '#333', // Update text color based on theme
      },
      data: { label: 'Processor' },
      position: { x: 750, y: 150 },
    },
    {
      id: 'horizontal-7',
      sourcePosition: 'right',
      targetPosition: 'left',
      style: {
        backgroundColor: theme === 'dark' ? '#444' : '#fff', // Update based on theme
        color: theme === 'dark' ? '#fff' : '#333', // Update text color based on theme
        fontSize: '8px',
        width: '50px',      // Set width
        height: '50px',     // Set height
        borderRadius: '50%', // Make it circular
        display: 'flex',     // Center the text
        justifyContent: 'center',
        alignItems: 'center',
      },
      data: { label: 'Worker' },
      position: { x: 750, y: 240 },
    },
    {
      id: 'horizontal-9',
      sourcePosition: 'right',
      targetPosition: 'left',
      style: {
        backgroundColor: theme === 'dark' ? '#444' : '#fff', // Update based on theme
        color: theme === 'dark' ? '#fff' : '#333', // Update text color based on theme
        fontSize: '8px',
        width: '50px',      // Set width
        height: '50px',     // Set height
        borderRadius: '50%', // Make it circular
        display: 'flex',     // Center the text
        justifyContent: 'center',
        alignItems: 'center',
      },
      data: { label: 'Worker' },
      position: { x: 750, y: 300 },
    },
  ];
   
  const initialEdges = [
    {
      id: 'horizontal-e1-2',
      source: 'horizontal-1',
      type: 'smoothstep',
      target: 'horizontal-2',
      animated: true,
    },
    {
      id: 'horizontal-e3-5',
      source: 'horizontal-3',
      type: 'smoothstep',
      target: 'horizontal-4',
      animated: true,
    },
    {
      id: 'horizontal-e3-6',
      source: 'horizontal-3',
      type: 'smoothstep',
      target: 'horizontal-5',
      animated: true,
    },
    {
      id: 'horizontal-e5-7',
      source: 'horizontal-5',
      type: 'smoothstep',
      target: 'horizontal-7',
      animated: true,
    },

    {
      id: 'horizontal-e6-9',
      source: 'horizontal-6',
      type: 'smoothstep',
      target: 'horizontal-5',
      animated: true,
    },
    {
      id: 'horizontal-e4-4',
      source: 'horizontal-4',
      type: 'smoothstep',
      target: 'horizontal-6',
      animated: true
    },
    {
      id: 'horizontal-6t',
      source: 'horizontal-5',
      type: 'smoothstep',
      target: 'horizontal-9',
      animated: true
    }
  ];
 
  // @ts-expect-error: this can throw error
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);// @ts-expect-error: this can throw error
  const onConnect = useCallback((params) => setEdges((els) => addEdge(params, els)), []);


  return (
    <div className="w-screen h-screen">
      <Appbar />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-left"
        style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff' }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

export default Page;