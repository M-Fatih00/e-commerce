import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import requests from "../../../api/requests";


export const fetchProductDetails = createAsyncThunk(
  "productDetails/fetchProductDetails",
  async (id: number, thunkAPI) => {
    try {
      const data = await requests.Catalog.details(id);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

interface ProductDetailsState {
  product: any;
  loading: boolean;
}

const initialState: ProductDetailsState = {
  product: null,
  loading: false
};

const productDetailsSlice = createSlice({
  name: "productDetails",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.product = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductDetails.rejected, (state) => {
        state.loading = false;
      });
  }
});

export default productDetailsSlice;