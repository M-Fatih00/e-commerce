import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import requests from "../../../api/requests";
import { IProductReview } from "../../../model/IProductReview";
import { getErrorMessage } from "../../../utils/errors";

export type ReviewError = {
  status: number;
  message: string;
};

const toReviewError = (error: any, fallback: string): ReviewError => ({
  status: Array.isArray(error) ? 400 : error?.response?.status ?? 0,
  message: getErrorMessage(error, fallback),
});

interface ReviewState {
  reviews: IProductReview[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  error: null,
};

export const getReviewsByProduct = createAsyncThunk<IProductReview[], number, { rejectValue: ReviewError }>(
  "review/getReviewsByProduct",
  async (productId, thunkAPI) => {
    try {
      return await requests.Review.getByProduct(productId);
    } catch (error) {
      return thunkAPI.rejectWithValue(toReviewError(error, "Yorumlar getirilemedi."));
    }
  },
);

export const createReview = createAsyncThunk<
  IProductReview,
  { productId: number; text: string; rating: number },
  { rejectValue: ReviewError }
>("review/createReview", async (data, thunkAPI) => {
  try {
    return await requests.Review.create(data);
  } catch (error) {
    return thunkAPI.rejectWithValue(toReviewError(error, "Yorum eklenemedi."));
  }
});

export const updateReview = createAsyncThunk<
  IProductReview,
  { id: number; data: { text: string; rating: number } },
  { rejectValue: ReviewError }
>("review/updateReview", async ({ id, data }, thunkAPI) => {
  try {
    return await requests.Review.update(id, data);
  } catch (error) {
    return thunkAPI.rejectWithValue(toReviewError(error, "Yorum güncellenemedi."));
  }
});

export const deleteReview = createAsyncThunk<number, number, { rejectValue: ReviewError }>(
  "review/deleteReview",
  async (id, thunkAPI) => {
    try {
      await requests.Review.delete(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(toReviewError(error, "Yorum silinemedi."));
    }
  },
);

const productReviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getReviewsByProduct.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getReviewsByProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.reviews = action.payload;
    });
    builder.addCase(getReviewsByProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message ?? null;
    });

    builder.addCase(createReview.fulfilled, (state, action) => {
      state.reviews.unshift(action.payload);
    });

    builder.addCase(updateReview.fulfilled, (state, action) => {
      const index = state.reviews.findIndex((x) => x.id === action.payload.id);
      if (index !== -1) state.reviews[index] = action.payload;
    });

    builder.addCase(deleteReview.fulfilled, (state, action) => {
      state.reviews = state.reviews.filter((x) => x.id !== action.payload);
    });
  },
});

export default productReviewSlice.reducer;