import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '@/app/config';

export default function Test ({ nodeId } : {nodeId: string}) {
  const [response, setResponse] = useState(null);

  const handleTestWebhook = async () => {
    try {
      const result = await axios.post(`${BACKEND_URL}/test-webhook`, { nodeId });
      setResponse(result.data);
    } catch (error) {
      console.error('Error testing webhook:', error);
    }
  };

  return (
    <div>
      <button onClick={handleTestWebhook}>Test Webhook</button>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </div>
  );
};


