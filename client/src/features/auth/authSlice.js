// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await api.post('/auth/register', { email, password });
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.error || 'Register failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.error || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    loading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('token'),
    token: localStorage.getItem('token'),
  },
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.setItem('logout', Date.now()); // sync logout across tabs
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
