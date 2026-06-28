import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import requests from "../../api/requests";
import { RootState } from "../../store/store";

export interface ICoupon {
  id: number;
  code: string;
  discountPercent: number;
}

const couponAdapter = createEntityAdapter<ICoupon, number>({
  selectId: (coupon) => coupon.id,
});

interface CouponState {
  coupons: ReturnType<typeof couponAdapter.getInitialState>;
  loading: boolean;
  error: string | null;
}

const initialState: CouponState = {
  coupons: couponAdapter.getInitialState(),
  loading: false,
  error: null,
};

// Thunk'lar

export const fetchCoupons = createAsyncThunk(
  "coupon/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await requests.Coupon.getAll();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const fetchCouponById = createAsyncThunk(
  "coupon/fetchById",
  async (id: number, thunkAPI) => {
    try {
      return await requests.Coupon.getById(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const createCoupon = createAsyncThunk(
  "coupon/create",
  async (data: { code: string; discountPercent: number }, thunkAPI) => {
    try {
      return await requests.Coupon.create(data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const updateCoupon = createAsyncThunk(
  "coupon/update",
  async ({ id, data }: { id: number; data: { code: string; discountPercent: number } }, thunkAPI) => {
    try {
      return await requests.Coupon.update(id, data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  "coupon/delete",
  async (id: number, thunkAPI) => {
    try {
      await requests.Coupon.delete(id);
      return id; // silinen id'yi döndür, adapter'dan kaldırmak için
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Slice

export const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchCoupons
    builder.addCase(fetchCoupons.pending, (state) => { state.loading = true; });
    builder.addCase(fetchCoupons.fulfilled, (state, action) => {
      state.loading = false;
      couponAdapter.setAll(state.coupons, action.payload);
    });
    builder.addCase(fetchCoupons.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload;
    });

    // fetchCouponById — güncelleme sayfası için mevcut kuponu yükle
    builder.addCase(fetchCouponById.pending, (state) => { state.loading = true; });
    builder.addCase(fetchCouponById.fulfilled, (state, action) => {
      state.loading = false;
      couponAdapter.upsertOne(state.coupons, action.payload);
    });
    builder.addCase(fetchCouponById.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload;
    });

    // createCoupon
    builder.addCase(createCoupon.pending, (state) => { state.loading = true; });
    builder.addCase(createCoupon.fulfilled, (state, action) => {
      state.loading = false;
      couponAdapter.addOne(state.coupons, action.payload);
    });
    builder.addCase(createCoupon.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload;
    });

    // updateCoupon
    builder.addCase(updateCoupon.pending, (state) => { state.loading = true; });
    builder.addCase(updateCoupon.fulfilled, (state, action) => {
      state.loading = false;
      couponAdapter.upsertOne(state.coupons, action.payload);
    });
    builder.addCase(updateCoupon.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload;
    });

    // deleteCoupon
    builder.addCase(deleteCoupon.fulfilled, (state, action) => {
      couponAdapter.removeOne(state.coupons, action.payload);
    });
    builder.addCase(deleteCoupon.rejected, (state, action: any) => {
      state.error = action.payload;
    });
  },
});

// Selector'lar

export const couponSelectors = couponAdapter.getSelectors(
  (state: RootState) => state.coupon.coupons
);

export default couponSlice.reducer;