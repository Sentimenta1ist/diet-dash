import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCurrentLanguage } from "../../configuration/i18n";
import authorizedAxios from "../../utils/authorizedAxios";

// Thunk for fetching products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ page = 0, size = 15, term = "", filter }) => {
    let lang = getCurrentLanguage();
    let productsUrl = '/products';
    switch (filter) {
      case "personal":
        productsUrl = '/products/created';
        break;
      default:
        productsUrl = '/products';
        break;
    }
    const response = await authorizedAxios.get(`${productsUrl}`, {
      params: {
        page,
        size,
        term,
        lang
      },
    });

    if (response.data && response.data.content) {
      const products = response.data.content.map((product) => ({
        id: product.id,
        name: product.name,
        grams: 100,
        calories: product.calories,
        protein: product.proteins,
        fat: product.fats,
        carbs: product.carbs,
      }));
      return {
        products,
        totalPages: response.data.totalPages,
        currentPage: response.data.pageable.pageNumber,
      };
    } else {
      console.error("No products found or content is undefined");
      return { products: [], totalPages: 0, currentPage: 0 };
    }
  }
);

// Thunk for adding a product
export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (productData, { dispatch }) => {
    // Use destructuring to access dispatch
    const response = await authorizedAxios.post(`/products`, productData, {
    });

    return response.data; // Assuming the response contains the added product details
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch products cases
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        console.log("rejected");
        state.loading = false;
        state.error = action.error.message;
      });

    // Add product cases
    builder
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default productSlice.reducer;
