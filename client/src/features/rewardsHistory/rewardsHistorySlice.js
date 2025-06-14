// src/features/rewardsHistory/rewardsHistorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig'; // Your configured axios instance

// ✅ Async Thunk for fetching rewards history (also used to get current points)
export const fetchRewardsHistory = createAsyncThunk(
  'rewardsHistory/fetchRewardsHistory',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue({ error: 'No authentication token found. Please log in.' });
      }

      const response = await api.get('/rewards', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Expected: { history: [], currentPoints: number }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: error.message || 'Failed to fetch rewards history' }
      );
    }
  }
);

// ✅ Alias for reuse in Rewards.js
export const fetchUserPoints = fetchRewardsHistory;

const rewardsHistorySlice = createSlice({
  name: 'rewardsHistory',
  initialState: {
    history: [],
    currentPoints: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearHistoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRewardsHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRewardsHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.history;
        state.currentPoints = action.payload.currentPoints;
      })
      .addCase(fetchRewardsHistory.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.error || action.error?.message || 'Failed to fetch rewards history';
        state.history = [];
        state.currentPoints = 0;
      });
  },
});

export const { clearHistoryError } = rewardsHistorySlice.actions;
export default rewardsHistorySlice.reducer;
