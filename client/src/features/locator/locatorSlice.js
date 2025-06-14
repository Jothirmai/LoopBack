// src/features/locator/locatorSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig'; // Import your configured axios instance

// Async Thunks for Locator functionality

export const fetchNearestCenters = createAsyncThunk(
  'locator/fetchNearestCenters',
  async ({ postcode, lat, lon }, { rejectWithValue }) => {
    try {
      let url = '/nearest';
      if (postcode) {
        url += `?postcode=${encodeURIComponent(postcode)}`;
      } else if (lat && lon) {
        url += `?lat=${lat}&lon=${lon}`;
      } else {
        // Default for initial load if no user location or postcode is given
        url += `?postcode=NW1 6XE`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch nearest centers' });
    }
  }
);

export const fetchDirections = createAsyncThunk(
  'locator/fetchDirections',
  async ({ postcode, userLat, userLon, centerId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/directions', {
        postcode: postcode || null,
        userLat: userLat || null,
        userLon: userLon || null,
        centerId: centerId,
      });
      return response.data.directions; // Assuming backend returns { directions: data }
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch directions' });
    }
  }
);

const locatorSlice = createSlice({
  name: 'locator',
  initialState: {
    centers: [],
    userLocation: null, // { lat, lon }
    selectedCenter: null,
    directions: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
    },
    setSelectedCenter: (state, action) => {
      state.selectedCenter = action.payload;
      state.directions = null; // Clear directions when a new center is selected
    },
    clearError: (state) => {
      state.error = null;
    },
    clearDirections: (state) => {
      state.directions = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Nearest Centers
      .addCase(fetchNearestCenters.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.centers = []; // Clear previous centers
        state.directions = null; // Clear directions when fetching new centers
      })
      .addCase(fetchNearestCenters.fulfilled, (state, action) => {
        state.loading = false;
        state.centers = action.payload;
      })
      .addCase(fetchNearestCenters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.error?.message || 'Failed to fetch nearest centers';
        state.centers = []; // Clear centers on error
      })
      // Fetch Directions
      .addCase(fetchDirections.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.directions = null; // Clear previous directions
      })
      .addCase(fetchDirections.fulfilled, (state, action) => {
        state.loading = false;
        state.directions = action.payload;
      })
      .addCase(fetchDirections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.error?.message || 'Failed to fetch directions';
        state.directions = null; // Clear directions on error
      });
  },
});

export const { setUserLocation, setSelectedCenter, clearError, clearDirections } = locatorSlice.actions;
export default locatorSlice.reducer;