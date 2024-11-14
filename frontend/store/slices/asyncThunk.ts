import { createAsyncThunk } from '@reduxjs/toolkit';
import { initializeZap } from './zapSlice';
import axios from 'axios';
import { BACKEND_URL } from '@/app/config';

// @ts-ignore
const fetchZapFromDB = async (id) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null; // Avoid localStorage on the server
  
      const response = await axios.get(`${BACKEND_URL}/api/v1/zap/${id}`, {
        headers: {
          Authorization: token
        }
      });
  
      const { trigger, actions } = response.data.zap;
      const nodes = [trigger, ...actions];
  
      console.log("Fetched nodes data:", nodes);
      return { nodes };
    } catch (error) {
      console.error("Error fetching zap data:", error);
      return { nodes: [] }; // Return an empty array on error
    }
  };
  

  export const loadZap = createAsyncThunk('zapSlice/loadZap', async (zapId, { dispatch }) => {
    
    const zapData = await fetchZapFromDB(zapId);
    console.log("zapdata : " + JSON.stringify(zapData));
    // @ts-ignore
    dispatch(initializeZap(zapData));
  });
  
