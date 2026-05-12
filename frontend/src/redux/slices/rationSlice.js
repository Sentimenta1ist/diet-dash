import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authorizedAxios from "../../utils/authorizedAxios";
import { formatDate } from "../../utils/dateUtils";

// Thunk for adding ration meal
export const addProduct = createAsyncThunk(
  "ration/addProduct",
  async ({ profileId, data }, { dispatch, rejectWithValue }) => {
    try {
      const processedDate = formatDate(data.date);
      const response = await authorizedAxios.post(
        `/ration/add/${profileId}`,
        {
          ...data,
          date: processedDate, // Use the processed date for the API request
        },
        {
          params: { date: processedDate } // Use the processed date in params
        }
      );

      // Dispatch fetchRation with the processed date
      dispatch(fetchRation({ profileId, startDate: processedDate  }));

      return response.data; // You can still return this if needed
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
// Thunk for fetching ration
export const fetchRation = createAsyncThunk(
  "ration/fetchRation",
  async ({ profileId, startDate }, { rejectWithValue }) => {
    try {
      const dateStr = formatDate(startDate);
      const response = await authorizedAxios.get(
        `/ration/${profileId}?date=${dateStr}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
// Thunk for deleting a meal from ration
export const deleteDietItem = createAsyncThunk(
  "ration/deleteDietItem",
  async (id, { rejectWithValue }) => {
    try {
      await authorizedAxios.delete(
        `/ration/delete/${id}`,
      );
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
// Thunk for updating a meal
export const updateDietItem = createAsyncThunk(
  "ration/updateDietItem",
  async (
    { mealId, updatedData, profileId, startDate },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // Send the PUT request to update the meal
      await authorizedAxios.put(
        `/ration/update/${mealId}`,
        updatedData
      );

      // Return the mealId and updated data directly since the response doesn't contain it
      return { mealId, updatedData }; // Use the data you sent in the request
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const rationSlice = createSlice({
  name: "ration",
  initialState: {
    dietItems: [],
    date: formatDate(new Date()),
    status: "idle",
    error: null,
  },
  reducers: {
    updateDietItemLocally(state, action) {
      const { mealId, updatedData } = action.payload;
      const existingMealIndex = state.dietItems.findIndex(
        (meal) => meal.id === mealId
      );

      if (existingMealIndex !== -1) {
        state.dietItems[existingMealIndex] = {
          ...state.dietItems[existingMealIndex],
          ...updatedData,
        };
      } else {
        console.error(`Meal with ID ${mealId} not found.`);
      }
    },
    setDate(state, action) {
    state.date = formatDate(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRation.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRation.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (!action.payload || action.payload === "") {
          state.dietItems = [];
        } else {
          state.dietItems = action.payload.meals
            .map((meal) => ({
              product: {
                id: meal.product.id,
                name: meal.productName,
                calories: meal.product.calories,
                proteins: meal.product.proteins,
                fats: meal.product.fats,
                carbs: meal.product.carbs,
              },
              time: meal.time,
              id: meal.id,
              grams: meal.grams,
            }))
            .sort((a, b) => {
              const dateA = new Date(`1970-01-01T${a.time}`);
              const dateB = new Date(`1970-01-01T${b.time}`);
              const dateComparison = dateA - dateB;
              return dateComparison === 0 ? a.id - b.id : dateComparison;
            });
        }
      })
      .addCase(updateDietItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Since we already updated locally, we can skip redundant updates here
        // Optionally, you could verify the server response if it returns something useful
      })
      .addCase(fetchRation.rejected, (state, action) => {
        state.status = "failed";
        console.error(action.payload);
        state.error = action.payload || "Failed to fetch ration data";
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to add product";
      })
      .addCase(updateDietItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update diet item";
      })
      .addCase(deleteDietItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteDietItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.dietItems = state.dietItems.filter(
          (item) => item.id !== action.payload
        );
      })
      .addCase(deleteDietItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to delete diet item";
      });
  },
});

export const { updateDietItemLocally, setDate } = rationSlice.actions;

export default rationSlice.reducer;
