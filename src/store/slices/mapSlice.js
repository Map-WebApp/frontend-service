import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  center: { lat: 10.776530, lng: 106.700981 }, // Ho Chi Minh City
  zoom: 13,
  userLocation: null,
  selectedPlace: null,
  savedLocations: [],
  directions: null,
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setCenter: (state, action) => {
      state.center = action.payload;
    },
    setZoom: (state, action) => {
      state.zoom = action.payload;
    },
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
    },
    setSelectedPlace: (state, action) => {
      state.selectedPlace = action.payload;
    },
    setSavedLocations: (state, action) => {
      state.savedLocations = action.payload;
    },
    addSavedLocation: (state, action) => {
      state.savedLocations.push(action.payload);
    },
    removeSavedLocation: (state, action) => {
      state.savedLocations = state.savedLocations.filter(loc => loc._id !== action.payload);
    },
    setDirections: (state, action) => {
      state.directions = action.payload;
    },
  },
});

export const { 
  setCenter, 
  setZoom, 
  setUserLocation, 
  setSelectedPlace, 
  setSavedLocations,
  addSavedLocation,
  removeSavedLocation,
  setDirections,
} = mapSlice.actions;

export default mapSlice.reducer; 