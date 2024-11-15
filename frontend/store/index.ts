import { configureStore } from '@reduxjs/toolkit';
import zapReducer from './slices/zapSlice';
import selectedNodeReducer from './slices/selectedNodeSlice';
import recordNodeReducer from './slices/recordSlice'
import themeReducer from './slices/themeSlice'

export const store = configureStore({
  reducer: {
    zapSlice: zapReducer,
    selectedNode: selectedNodeReducer, 
    RecordState: recordNodeReducer,
    theme: themeReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;