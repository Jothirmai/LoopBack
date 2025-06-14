// src/app/store.js (or wherever your store is configured)
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import locatorReducer from '../features/locator/locatorSlice';
import rewardsReducer from '../features/rewards/rewardsSlice';
import rewardsHistoryReducer from '../features/rewardsHistory/rewardsHistorySlice';
import scannerReducer from '../features/scanner/scannerSlice'; // Import the new reducer

export const store = configureStore({
  reducer: {
    auth: authReducer,
    locator: locatorReducer,
    rewards: rewardsReducer,
    rewardsHistory: rewardsHistoryReducer,
    scanner: scannerReducer, // Add the scanner reducer here
  },
});