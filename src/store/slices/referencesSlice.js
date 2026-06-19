import { createSlice } from "@reduxjs/toolkit";

const getUserFromStorage = () => {
  try {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const getPermissionsFromStorage = () => {
  try {
    const saved = localStorage.getItem("userPermission");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const initialState = {
  currentUser: getUserFromStorage(),
  regions: [],
  userPermission: getPermissionsFromStorage(),
};

export const referencesSlice = createSlice({
  name: "references",
  initialState,
  reducers: {
    setCurrentUser: (state, { payload }) => {
      state.currentUser = payload;

      if (payload) {
        localStorage.setItem(
          "currentUser",
          JSON.stringify(payload)
        );
      } else {
        localStorage.removeItem("currentUser");
      }
    },

    setRegions: (state, { payload }) => {
      state.regions = payload;
    },

    setUserPermission: (state, { payload }) => {
      state.userPermission = payload || {};

      if (payload) {
        localStorage.setItem(
          "userPermission",
          JSON.stringify(payload)
        );
      } else {
        localStorage.removeItem("userPermission");
      }
    },
  },
});

export const {
  setCurrentUser,
  setRegions,
  setUserPermission,
} = referencesSlice.actions;

export default referencesSlice.reducer;