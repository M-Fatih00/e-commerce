import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { ICategory } from "../../model/ICategory";
import requests from "../../api/requests";
import { RootState } from "../../store/store";

export const fetchCategories = createAsyncThunk<ICategory[]>(
  "category/fetchCategories",
  async () => {
    return await requests.Categories.list();
  }
);

const categoryAdapter = createEntityAdapter<ICategory>();

const initialState = categoryAdapter.getInitialState({
  status: "idle",
  isLoaded: false
});

export const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {

    builder.addCase(fetchCategories.pending, (state) => {
      state.status = "loading";
    });

    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      categoryAdapter.setAll(state, action.payload);
      state.status = "idle";
      state.isLoaded = true;
    });

    builder.addCase(fetchCategories.rejected, (state) => {
      state.status = "idle";
    });

  }
});

export const {
  selectAll: selectAllCategories,
  selectById: selectCategoryById
} = categoryAdapter.getSelectors((state: RootState) => state.category);

export default categorySlice.reducer;