// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "./slices/profileSlice";
import profilesDataReducer from "./slices/profilesDataSlice";
import productReducer from "./slices/productSlice";
import rationReducer from "./slices/rationSlice";
import productSearchReducer from "./slices/productSearchSlice";
import profileListReducer from "./slices/profileListSlice";

const store = configureStore({
  reducer: {
    profilesData: profilesDataReducer,
    profile: profileReducer,
    products: productReducer,
    ration: rationReducer,
    productSearch: productSearchReducer,
    profileList: profileListReducer,
  },
});

export default store;
