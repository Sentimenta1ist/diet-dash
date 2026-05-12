import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authorizedAxios from "../../utils/authorizedAxios";
import {
  calculateDailyCalorieNorm,
  calculateGramsFromPercentage,
  calculateIdealBodyWeight, // Added import
} from "../../utils/healthCalculations";

// Async thunk for fetching activities
export const fetchActivities = createAsyncThunk(
  "profile/fetchActivities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authorizedAxios.get(
        `/profile/activities`
      );

      return response.data.map((activity) => ({
        id: activity.id,
        description: activity.description,
        multiplier: activity.multiplier,
      }));
    } catch (error) {
      return rejectWithValue("Error fetching activities");
    }
  }
);

// Async thunk for updating the profile
export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async ({ selectedProfileId, updatedProfile }, { rejectWithValue }) => {
    try {
      const apiPayload = {
        ...updatedProfile,
        ...(updatedProfile.activity ? { activity: updatedProfile.activity.id } : { activity: 0 }),
      };
      const response = await authorizedAxios.put(
        `/profile/${selectedProfileId}`,
        apiPayload
      );
      if (response.status === 200) {
        return updatedProfile;
      } else {
        return rejectWithValue("Failed to update profile");
      }
    } catch (error) {
      return rejectWithValue(error.response.data || "Error updating profile");
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    user: {},
    activities: [],
    status: "idle",
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setSelectedActivity: (state, action) => {
      state.user.activity = {
        id: action.payload.value,
        description: action.payload.label,
        multiplier: action.payload.multiplier,
      };
      recalculateProfile(state, { field: "activity" });
    },
    resetProfileState: (state) => {
      return {
        user: {},
        activities: [],
        status: "idle",
        error: null,
      };
    },
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state.user[field] = value;
      recalculateProfile(state, { field });
    },
    recalculateProfile: (state, action = {}) => {
      const { user } = state;
      const { field } = action.payload;

      const weight = Number(user.weight) || 0;
      const height = Number(user.height) || 0;
      const age = Number(user.age) || 0;
      const activityCoef = user.activity?.multiplier || 1;
      const gender = user.gender || "unknown";

      // Calculate ideal body weight using utility function
      state.user.idealBodyWeight = calculateIdealBodyWeight({ height, gender });

      // Recalculate dailyCalorieNorm and bodyMassIndex
      const dailyCalorieNorm =
        weight && height && age
          ? calculateDailyCalorieNorm({
            weight,
            height,
            age,
            gender,
            activityCoef,
          })
          : user.dailyCalorieNorm || 0;
      state.user.dailyCalorieNorm = dailyCalorieNorm;
      state.user.bodyMassIndex =
        weight && height
          ? parseFloat((weight / (height / 100) ** 2).toFixed(2)).toString()
          : user.bodyMassIndex || 0;

      // Reset selectedCalorieLimit to dailyCalorieNorm if general info fields change
      const generalInfoFields = ["age", "gender", "weight", "height", "activity"];
      if (field && generalInfoFields.includes(field)) {
        user.selectedCalorieLimit = dailyCalorieNorm;
      }

      // Recalculate PCF limits based on selectedCalorieLimit and percentages
      const selectedCalorieLimit = user.selectedCalorieLimit || dailyCalorieNorm;

      if (selectedCalorieLimit > 0) {
        // Set default percentages if all are zero
        if (
          (user.dailyProteinPercentage || 0) === 0 &&
          (user.dailyCarbsPercentage || 0) === 0 &&
          (user.dailyFatPercentage || 0) === 0
        ) {
          state.user.dailyProteinPercentage = 30;
          state.user.dailyCarbsPercentage = 40;
          state.user.dailyFatPercentage = 30;
        }

        state.user.dailyProteinLimit = calculateGramsFromPercentage(
          user.dailyProteinPercentage || 0,
          "protein",
          selectedCalorieLimit
        );
        state.user.dailyFatLimit = calculateGramsFromPercentage(
          user.dailyFatPercentage || 0,
          "fat",
          selectedCalorieLimit
        );
        state.user.dailyCarbsLimit = calculateGramsFromPercentage(
          user.dailyCarbsPercentage || 0,
          "carbs",
          selectedCalorieLimit
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.activities = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

// Helper function for internal recalculation
const recalculateProfile = (state, { field }) => {
  state.user = { ...state.user }; // Ensure Immer detects changes
  profileSlice.caseReducers.recalculateProfile(state, { payload: { field } });
};

export const { setUser, setSelectedActivity, resetProfileState, updateField, recalculateProfile: recalculateProfileAction } =
  profileSlice.actions;
export default profileSlice.reducer;