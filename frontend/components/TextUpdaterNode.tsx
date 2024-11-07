import React from 'react';
import { Handle, Position } from '@xyflow/react';

// @ts-ignore
export default function TextUpdaterNode({ data }) {
  const [label, setLabel] = React.useState(data.label);

  // @ts-ignore
  const handleChange = (event) => setLabel(event.target.value);

  return (
    <div style={{ padding: 10, border: '1px solid #ddd', backgroundColor: '#fff', position: 'relative' }}>
      <h4>{data.type === 'trigger' ? 'Trigger' : 'Action'}</h4>
      <input type="text" value={label} onChange={handleChange} />

      {/* Adding handles for connection points */}
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    </div>
  );
}
