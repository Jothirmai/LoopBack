import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

// ----------------------
// Async Thunks
// ----------------------

// Fetch available rewards
export const fetchRewards = createAsyncThunk(
  'rewards/fetchRewards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/rewards/a'); // Adjust route if needed
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: error.message || 'Failed to fetch rewards' }
      );
    }
  }
);

// Redeem a specific reward
export const redeemReward = createAsyncThunk(
  'rewards/redeemReward',
  async (rewardId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue({ error: 'No authentication token found. Please log in.' });
      }

      const response = await api.post(
        '/rewards',
        { rewardId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Response is expected to include message and updated currentPoints
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: error.message || 'Failed to redeem reward' }
      );
    }
  }
);

// ----------------------
// Rewards Slice
// ----------------------

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState: {
    rewards: [],
    loading: false,
    error: null,
    message: null,
    currentPoints: 0,
  },
  reducers: {
    clearRewardsMessage: (state) => {
      state.message = null;
    },
    clearRewardsError: (state) => {
      state.error = null;
    },
    setCurrentPoints: (state, action) => {
      state.currentPoints = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Rewards
      .addCase(fetchRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = Array.isArray(action.payload)
          ? action.payload
          : action.payload.rewards || [];
        if (action.payload.currentPoints !== undefined) {
          state.currentPoints = action.payload.currentPoints;
        }
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading = false;
        state.rewards = [];
        state.error = action.payload?.error || action.error?.message || 'Failed to fetch rewards';
      })

      // Redeem Reward
      .addCase(redeemReward.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(redeemReward.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || 'Reward redeemed successfully!';
        if (action.payload.currentPoints !== undefined) {
          state.currentPoints = action.payload.currentPoints;
        }
      })
      .addCase(redeemReward.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.error || action.error?.message || 'Failed to redeem reward';
      });
  },
});

// ----------------------
// Exports
// ----------------------

export const {
  clearRewardsMessage,
  clearRewardsError,
  setCurrentPoints,
} = rewardsSlice.actions;

export default rewardsSlice.reducer;
