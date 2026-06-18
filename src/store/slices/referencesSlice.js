import { createSlice } from '@reduxjs/toolkit';

const getUserFromStorage = () => {
  try {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const initialState = {
  currentUser: getUserFromStorage(),
  regions: []
};

export const referencesSlice = createSlice({
  name: 'references',
  initialState,
  reducers: {
    setCurrentUser: (state, { payload }) => {
      state.currentUser = payload;
      try {
        if (payload) {
          localStorage.setItem('currentUser', JSON.stringify(payload));
        } else {
          localStorage.removeItem('currentUser');
        }
      } catch { }
    },
    setRegions: (state, { payload }) => {
      state.regions = payload
    }
  },
});

export const { setCurrentUser, setRegions } = referencesSlice.actions;

export default referencesSlice.reducer;