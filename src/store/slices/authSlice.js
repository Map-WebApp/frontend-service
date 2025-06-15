import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isLoading: false,
  error: null,
  registrationSuccess: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
    },
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
      state.registrationSuccess = false;
    },
    registerSuccess: (state) => {
      state.isLoading = false;
      state.error = null;
      state.registrationSuccess = true;
    },
    registerFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.registrationSuccess = false;
    },
    clearRegistrationStatus: (state) => {
      state.registrationSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
  clearRegistrationStatus,
  clearError,
} = authSlice.actions;

export default authSlice.reducer; 