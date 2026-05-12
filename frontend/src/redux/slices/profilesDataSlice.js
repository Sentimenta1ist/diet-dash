import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authorizedAxios from "../../utils/authorizedAxios";

// Keep your existing fetchProfiles thunk
export const fetchProfiles = createAsyncThunk(
  "profilesData/fetchProfiles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authorizedAxios.get("/profile");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching profiles");
    }
  }
);

const profilesDataSlice = createSlice({
  name: "profilesData",
  initialState: {
    profiles: [],
    selectedProfile: null,
    profilesLoading: false,
    error: null,
  },
  reducers: {
    setSelectedProfile: (state, action) => {
      state.selectedProfile = action.payload;
    },
    resetProfilesState: (state) => {
      return {
        profiles: [],
        selectedProfile: null,
        profilesLoading: false,
        error: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfiles.pending, (state) => {
        state.profilesLoading = true;
        state.error = null;
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.profiles = Array.isArray(action.payload) ? action.payload : [];
        state.profilesLoading = false;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.profilesLoading = false;
        state.error = action.payload;
      })
      // Listen to deleteProfile from profileListSlice
      .addMatcher(
        (action) => action.type === "profileList/deleteProfile/fulfilled",
        (state, action) => {
          // Remove the deleted profile from profiles array
          state.profiles = state.profiles.filter(
            (profile) => profile.id !== action.payload
          );
          // If the selectedProfile was deleted, reset it
          if (state.selectedProfile?.id === action.payload) {
            state.selectedProfile = null;
          }
        }
      );
  },
});

export const { setSelectedProfile, resetProfilesState } = profilesDataSlice.actions;
export default profilesDataSlice.reducer;