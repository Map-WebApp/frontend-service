import { configureStore } from '@reduxjs/toolkit';
import mapReducer from './slices/mapSlice';
import searchReducer from './slices/searchSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    search: searchReducer,
    ui: uiReducer,
    auth: authReducer,
  },
});

export default store; 