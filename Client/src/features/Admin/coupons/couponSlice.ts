import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import requests from "../../../api/requests";
import { RootState } from "../../../store/store";
import { getErrorMessage } from "../../../utils/errors";

export interface ICoupon {
  id: number;
  code: string;
  discountPercent: number;
}

export type CouponInput = {
  code: string;
  discountPercent: number;
};

export type CouponError = {
  status: number;
  message: string;
};

const toCouponError = (error: any, fallback: string): CouponError => ({
  status: Array.isArray(error) ? 400 : error?.response?.status ?? 0,
  message: getErrorMessage(error, fallback),
});

const couponAdapter = createEntityAdapter<ICoupon, number>({
  selectId: (coupon) => coupon.id,
  sortComparer: (a, b) => a.code.localeCompare(b.code),
});

interface CouponState {
  coupons: ReturnType<typeof couponAdapter.getInitialState>;
  loading: boolean;
  saving: boolean;
}

const initialState: CouponState = {
  coupons: couponAdapter.getInitialState(),
  loading: false,
  saving: false,
};

export const fetchCoupons = createAsyncThunk<ICoupon[], void, { rejectValue: CouponError }>(
  "coupon/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await requests.Coupon.getAll();
    } catch (error) {
      return thunkAPI.rejectWithValue(toCouponError(error, "Kuponlar getirilemedi."));
    }
  },
);

export const fetchCouponById = createAsyncThunk<ICoupon, number, { rejectValue: CouponError }>(
  "coupon/fetchById",
  async (id, thunkAPI) => {
    try {
      return await requests.Coupon.getById(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(toCouponError(error, "Kupon getirilemedi."));
    }
  },
);

export const createCoupon = createAsyncThunk<ICoupon, CouponInput, { rejectValue: CouponError }>(
  "coupon/create",
  async (data, thunkAPI) => {
    try {
      return await requests.Coupon.create(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(toCouponError(error, "Kupon oluşturulamadı."));
    }
  },
);

export const updateCoupon = createAsyncThunk<ICoupon, { id: number; data: CouponInput }, { rejectValue: CouponError }>(
  "coupon/update",
  async ({ id, data }, thunkAPI) => {
    try {
      return await requests.Coupon.update(id, data);
    } catch (error) {
      return thunkAPI.rejectWithValue(toCouponError(error, "Kupon güncellenemedi."));
    }
  },
);

export const deleteCoupon = createAsyncThunk<number, number, { rejectValue: CouponError }>(
  "coupon/delete",
  async (id, thunkAPI) => {
    try {
      await requests.Coupon.delete(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(toCouponError(error, "Kupon silinemedi."));
    }
  },
);

export const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCoupons.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCoupons.fulfilled, (state, action) => {
      state.loading = false;
      couponAdapter.setAll(state.coupons, action.payload);
    });
    builder.addCase(fetchCoupons.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(fetchCouponById.fulfilled, (state, action) => {
      couponAdapter.upsertOne(state.coupons, action.payload);
    });

    builder.addCase(createCoupon.pending, (state) => {
      state.saving = true;
    });
    builder.addCase(createCoupon.fulfilled, (state, action) => {
      state.saving = false;
      couponAdapter.addOne(state.coupons, action.payload);
    });
    builder.addCase(createCoupon.rejected, (state) => {
      state.saving = false;
    });

    builder.addCase(updateCoupon.pending, (state) => {
      state.saving = true;
    });
    builder.addCase(updateCoupon.fulfilled, (state, action) => {
      state.saving = false;
      couponAdapter.upsertOne(state.coupons, action.payload);
    });
    builder.addCase(updateCoupon.rejected, (state) => {
      state.saving = false;
    });

    builder.addCase(deleteCoupon.fulfilled, (state, action) => {
      couponAdapter.removeOne(state.coupons, action.payload);
    });
  },
});

export const couponSelectors = couponAdapter.getSelectors((state: RootState) => state.coupon.coupons);

export default couponSlice.reducer;