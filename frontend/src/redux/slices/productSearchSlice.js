import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCurrentLanguage } from "../../configuration/i18n";
import authorizedAxios from "../../utils/authorizedAxios";

export const fetchSearchProducts = createAsyncThunk(
  "productSearch/fetchSearchProducts",
  async ({ searchTerm, page, size = 10 }) => {
    const selectedLanguage = getCurrentLanguage();
    const response = await authorizedAxios.get(`/products`, {
      params: {
        term: searchTerm,
        page: page,
        size: size,
        lang: selectedLanguage
      },
    });

    // Transform the data as needed
    return response.data; // Adjust this based on your response structure
  }
);

const productSearchSlice = createSlice({
  name: "productSearch",
  initialState: {
    searchResults: [],
    loading: false,
    hasMore: true,
    page: 0,
    error: null,
  },
  reducers: {
    resetSearch: (state) => {
      state.searchResults = [];
      state.page = 0;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSearchProducts.fulfilled, (state, action) => {
        const { content, totalPages } = action.payload;
        state.loading = false;
        // For new input, replace search results, but append results on scrolling
        if (state.page === 0) {
          state.searchResults = content.map((product) => ({
            id: product.id,
            name: product.name,
            grams: 100,
            calories: product.calories,
            protein: product.proteins,
            fat: product.fats,
            carbs: product.carbs,
            created: product.created
          }));
        } else {
          state.searchResults.push(
            ...content.map((product) => ({
              id: product.id,
              name: product.name,
              grams: 100,
              calories: product.calories,
              protein: product.proteins,
              fat: product.fats,
              carbs: product.carbs,
              created: product.created
            }))
          );
        }

        state.page += 1; // Increment page for infinite scroll
        state.hasMore = state.page < totalPages; // Check if more pages are available
      })
      .addCase(fetchSearchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { resetSearch } = productSearchSlice.actions;

export default productSearchSlice.reducer;
