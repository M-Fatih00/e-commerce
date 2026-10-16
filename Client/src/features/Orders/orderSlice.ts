import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import requests from "../../api/requests";
import { ICreateOrder, IOrder } from "../../model/IOrder";
import { getErrorMessage } from "../../utils/errors";

interface OrderState {
  currentOrder: IOrder | null;
  orders: IOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  currentOrder: null,
  orders: [],
  loading: false,
  error: null,
};

export type OrderError = {
  status: number;
  message: string;
};

export const createOrder = createAsyncThunk<IOrder, ICreateOrder, { rejectValue: OrderError }>(
  "order/create",
  async (data, thunkAPI) => {
    try {
      const order: IOrder = await requests.Order.create(data);
      if (order?.stripeSessionUrl) window.location.assign(order.stripeSessionUrl);
      return order;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({
        status: Array.isArray(error) ? 400 : error?.response?.status ?? 0,
        message: getErrorMessage(error, "Sipariş oluşturulamadı."),
      });
    }
  },
);

export const getMyOrders = createAsyncThunk(
  "order/getMyOrders",
  async (_, thunkAPI) => {
    try {
      return await requests.Order.getMyOrders();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

export const getOrderById = createAsyncThunk(
  "order/getById",
  async (id: number, thunkAPI) => {
    try {
      return await requests.Order.getById(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearCurrentOrder(state) {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {

    builder.addCase(createOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createOrder.fulfilled, (state, action) => {
      state.loading = false;
      state.currentOrder = action.payload;
    });
    builder.addCase(createOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message ?? null;
    });


    builder.addCase(getMyOrders.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getMyOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    });
    builder.addCase(getMyOrders.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload;
    });


    builder.addCase(getOrderById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getOrderById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentOrder = action.payload;
    });
    builder.addCase(getOrderById.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
