import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authorizedAxios from "../../utils/authorizedAxios";

export const fetchProfiles = createAsyncThunk(
  "profileList/fetchProfiles",
  async ({ page = 0, size = 15, term = "" }, { rejectWithValue }) => {
    try {
      // Fetch profile list with search and pagination
      const response = await authorizedAxios.get(`/profile/list`, {
        params: {
          page,
          size,
          term,
        },
      });

      const { content, totalPages, number } = response.data;

      return {
        profiles: content,
        totalPages,
        currentPage: number,
      };
    } catch (error) {
      return rejectWithValue("Error fetching profiles");
    }
  }
);

export const deleteProfile = createAsyncThunk(
  "profileList/deleteProfile",
  async (profileId, { rejectWithValue }) => {
    try {
      const response = await authorizedAxios.delete(
        `/profile/${profileId}`
      );
      if (response.status === 200 || response.status === 204) {
        return profileId; // Return the deleted profile ID
      }
      return rejectWithValue("Failed to delete profile");
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error deleting profile");
    }
  }
);

const profileListSlice = createSlice({
  name: "profileList",
  initialState: {
    profiles: [],
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfiles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = action.payload.profiles;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = state.profiles.filter(
          (profile) => profile.id !== action.payload
        );
        // Adjust totalPages if necessary (optional, depends on API)
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default profileListSlice.reducer;