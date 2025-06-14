// src/features/scanner/scannerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig'; // Ensure you have your configured axios instance

// Async Thunk for processing a QR scan
export const processScan = createAsyncThunk(
  'scanner/processScan',
  async ({ qrCode, userLat, userLon }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue({ error: 'Authentication required. Please log in.' });
      }

      // Assuming your backend endpoint for scanning is '/scan' or similar
      const response = await api.post(
        '/scan', // Adjust this endpoint based on your backend API
        { qrCode, userLat, userLon },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; // Expected: { message: "Points awarded!", points: 10 } or similar
    } catch (error) {
      // Axios error structure
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return rejectWithValue(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        return rejectWithValue({ error: 'No response from server. Please check your internet connection.' });
      } else {
        // Something happened in setting up the request that triggered an Error
        return rejectWithValue({ error: error.message || 'An unexpected error occurred.' });
      }
    }
  }
);

const scannerSlice = createSlice({
  name: 'scanner',
  initialState: {
    userLocation: null, // { lat, lon }
    hasCameraAccess: false,
    loading: false,
    scanResult: null, // Success message/data after scan
    scanError: null, // Error message after scan
    localError: null, // For UI-related errors (e.g., no location, no camera access)
  },
  reducers: {
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
      state.localError = null; // Clear local error if location is successfully set
    },
    setHasCameraAccess: (state, action) => {
      state.hasCameraAccess = action.payload;
      state.localError = null; // Clear local error if camera access is granted
    },
    setLocalError: (state, action) => {
      state.localError = action.payload;
    },
    clearScanStatus: (state) => {
      state.scanResult = null;
      state.scanError = null;
    },
    clearAllScannerErrors: (state) => {
      state.scanError = null;
      state.localError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processScan.pending, (state) => {
        state.loading = true;
        state.scanResult = null;
        state.scanError = null;
      })
      .addCase(processScan.fulfilled, (state, action) => {
        state.loading = false;
        state.scanResult = action.payload.message || 'Scan processed successfully!';
        // You might want to update user points here if returned from the backend
        // e.g., state.currentUserPoints += action.payload.points;
      })
      .addCase(processScan.rejected, (state, action) => {
        state.loading = false;
        // Action.payload is the value returned by rejectWithValue
        state.scanError = action.payload?.error || action.error?.message || 'Failed to process scan.';
      });
  },
});

export const {
  setUserLocation,
  setHasCameraAccess,
  setLocalError,
  clearScanStatus,
  clearAllScannerErrors,
} = scannerSlice.actions;

export default scannerSlice.reducer;