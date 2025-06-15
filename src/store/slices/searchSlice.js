import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchText: '',
  recentSearches: [],
  searchSuggestions: [],
  isSearching: false,
  searchResults: [],
  error: null,
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchText: (state, action) => {
      state.searchText = action.payload;
    },
    addRecentSearch: (state, action) => {
      // Kiểm tra trùng lặp và giới hạn lịch sử tìm kiếm lên 10 mục
      const exists = state.recentSearches.some(item => 
        item.placeId === action.payload.placeId
      );
      
      if (!exists) {
        state.recentSearches = [
          action.payload, 
          ...state.recentSearches
        ].slice(0, 10);
      }
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    setSearchSuggestions: (state, action) => {
      state.searchSuggestions = action.payload;
    },
    setIsSearching: (state, action) => {
      state.isSearching = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setSearchError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setSearchText, 
  addRecentSearch, 
  clearRecentSearches,
  setSearchSuggestions,
  setIsSearching,
  setSearchResults,
  setSearchError
} = searchSlice.actions;

export default searchSlice.reducer; 