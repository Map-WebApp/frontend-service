import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  drawerOpen: false,
  sidePanelOpen: false,
  sidePanelTab: 'info', // 'info' | 'directions' | 'saved'
  directionsExpanded: false,
  mapType: 'roadmap', // 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
  showTraffic: false,
  isMobileView: window.innerWidth < 768, // Responsive layout detection
  toasts: [], // For displaying notifications/alerts
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDrawerOpen: (state, action) => {
      state.drawerOpen = action.payload;
    },
    setSidePanelOpen: (state, action) => {
      state.sidePanelOpen = action.payload;
    },
    setSidePanelTab: (state, action) => {
      state.sidePanelTab = action.payload;
    },
    setDirectionsExpanded: (state, action) => {
      state.directionsExpanded = action.payload;
    },
    setMapType: (state, action) => {
      state.mapType = action.payload;
    },
    toggleTraffic: (state) => {
      state.showTraffic = !state.showTraffic;
    },
    setIsMobileView: (state, action) => {
      state.isMobileView = action.payload;
    },
    addToast: (state, action) => {
      state.toasts.push({
        id: Date.now(),
        ...action.payload
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
  },
});

export const { 
  setDrawerOpen, 
  setSidePanelOpen,
  setSidePanelTab,
  setDirectionsExpanded,
  setMapType,
  toggleTraffic,
  setIsMobileView,
  addToast,
  removeToast
} = uiSlice.actions;

export default uiSlice.reducer; 