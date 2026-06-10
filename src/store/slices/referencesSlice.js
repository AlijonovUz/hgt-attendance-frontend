import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: null,
};

export const counterSlice = createSlice({
  name: 'referencesSlice',
  initialState,
  reducers: {
    
  },
});

export const {  } = counterSlice.actions;

export default counterSlice.reducer;