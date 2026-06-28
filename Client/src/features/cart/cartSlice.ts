import {
  createAsyncThunk,
  createSlice,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";
import { ICartItem } from "../../model/ICart";
import requests from "../../api/requests";
import { RootState } from "../../store/store";

// EntityAdapter — urunId ile normalize yapı
const cartItemsAdapter = createEntityAdapter<ICartItem, number>({
  selectId: (item) => item.cartItemId,
});

export interface CartState {
  cartId: number | null;
  customerId: string | null;
  araToplam: number;
  toplam: number;
  loadingItems: Record<number, boolean>;
  initialLoading: boolean;
  error: string | null;
  cartItems: ReturnType<typeof cartItemsAdapter.getInitialState>;

  couponCode: string | null;
  couponDiscount: number;
  kuponIndirimi: number;
  yeniToplam: number | null;
  hizliKargo: boolean;
}

const initialState: CartState = {
  cartId: null,
  customerId: null,
  araToplam: 0,
  toplam: 0,
  loadingItems: {},
  initialLoading: false,
  error: null,
  cartItems: cartItemsAdapter.getInitialState(),
  couponCode: null,
  couponDiscount: 0,
  kuponIndirimi: 0,
  yeniToplam: null,
  hizliKargo: false,
};

// Backend'den gelen cart'ı state'e yükle
const loadCartIntoState = (state: CartState, payload: any) => {
  state.cartId = payload.cartId ?? null;
  state.customerId = payload.customerId ?? null;
  state.araToplam = payload.araToplam ?? 0;
  state.toplam = payload.toplam ?? 0;
  cartItemsAdapter.setAll(state.cartItems, payload.cartItems ?? []);
};

// Thunk'lar

export const getCart = createAsyncThunk("cart/getCart", async (_, thunkAPI) => {
  try {
    return await requests.Cart.getCart();
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data);
  }
});

export const addItem = createAsyncThunk(
  "cart/addItem",
  async (
    {
      urunId,
      miktar = 1,
      beden,
      renk,
    }: { urunId: number; miktar?: number; beden?: string; renk?: string },
    thunkAPI,
  ) => {
    try {
      return await requests.Cart.addItem(urunId, miktar, beden, renk);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ urunId, error: error.response?.data });
    }
  },
);

export const removeItem = createAsyncThunk(
  "cart/removeItem",
  async (
    {
      urunId,
      miktar = 1,
      beden,
      renk,
    }: {
      urunId: number;
      miktar?: number;
      beden?: string | null;
      renk?: string | null;
    },
    thunkAPI,
  ) => {
    try {
      return await requests.Cart.removeItem(urunId, miktar, beden, renk);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ urunId, error: error.response?.data });
    }
  },
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, thunkAPI) => {
    try {
      return await requests.Cart.clear();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

export const applyCoupon = createAsyncThunk(
  "cart/applyCoupon",
  async (code: string, thunkAPI) => {
    try {
      return await requests.Coupon.apply(code);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

// Slice

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Optimistic increment — backend cevabını beklemeden UI'ı güncelle
    incrementItem(state, action: { payload: { cartItemId: number } }) {
      const item = state.cartItems.entities[action.payload.cartItemId];
      if (!item) return;
      cartItemsAdapter.updateOne(state.cartItems, {
        id: action.payload.cartItemId,
        changes: { miktar: item.miktar + 1 },
      });
    },

    // Optimistic decrement — 1'de kalırsa azaltma, 0 olursa sil
    decrementItem(state, action: { payload: { cartItemId: number } }) {
      const item = state.cartItems.entities[action.payload.cartItemId];
      if (!item) return;
      if (item.miktar <= 1) return;
      cartItemsAdapter.updateOne(state.cartItems, {
        id: action.payload.cartItemId,
        changes: { miktar: item.miktar - 1 },
      });
    },

    // Optimistic remove all — tüm item'ı sil
    removeItemOptimistic(state, action: { payload: { cartItemId: number } }) {
      cartItemsAdapter.removeOne(state.cartItems, action.payload.cartItemId);
    },

    // Kuponu manuel sıfırla (opsiyonel — sepet güncellenince çağrılabilir)
    resetCoupon(state) {
      state.couponCode = null;
      state.couponDiscount = 0;
      state.kuponIndirimi = 0;
      state.yeniToplam = null;
    },

    // Sepeti manuel sıfırla
    resetCartState(state) {
      cartItemsAdapter.removeAll(state.cartItems);
      state.araToplam = 0;
      state.toplam = 0;
      state.cartId = null;
      state.hizliKargo = false;
    },

    // hızlı kargo toggle
    setHizliKargo(state, action: { payload: boolean }) {
      state.hizliKargo = action.payload;
    },
  },

  extraReducers(builder) {
    // ── getCart ──
    builder.addCase(getCart.pending, (state) => {
      state.initialLoading = true;
    });
    builder.addCase(getCart.fulfilled, (state, action) => {
      state.initialLoading = false;
      loadCartIntoState(state, action.payload);
    });
    builder.addCase(getCart.rejected, (state, action: any) => {
      state.initialLoading = false;
      state.error = action.payload;
    });

    // ── addItem ──
    builder.addCase(addItem.pending, (state, action) => {
      state.loadingItems[action.meta.arg.urunId] = true;
    });
    builder.addCase(addItem.fulfilled, (state, action) => {
      const urunId = action.meta.arg.urunId;
      delete state.loadingItems[urunId];
      state.araToplam = action.payload.araToplam;
      state.toplam = action.payload.toplam;
      cartItemsAdapter.setAll(state.cartItems, action.payload.cartItems);
    });
    builder.addCase(addItem.rejected, (state, action: any) => {
      const urunId = action.payload?.urunId;
      if (urunId) delete state.loadingItems[urunId];
      state.error = action.payload?.error;
    });

    // ── removeItem ──
    builder.addCase(removeItem.pending, (state, action) => {
      state.loadingItems[action.meta.arg.urunId] = true;
    });
    builder.addCase(removeItem.fulfilled, (state, action) => {
      const urunId = action.meta.arg.urunId;
      delete state.loadingItems[urunId];
      state.araToplam = action.payload.araToplam;
      state.toplam = action.payload.toplam;
      cartItemsAdapter.setAll(state.cartItems, action.payload.cartItems);
    });
    builder.addCase(removeItem.rejected, (state, action: any) => {
      const urunId = action.payload?.urunId;
      if (urunId) delete state.loadingItems[urunId];
      state.error = action.payload?.error;
    });

    // ── clearCart ──
    builder.addCase(clearCart.fulfilled, (state) => {
      cartItemsAdapter.removeAll(state.cartItems);
      state.araToplam = 0;
      state.toplam = 0;
      state.cartId = null;
      state.customerId = null;
      state.hizliKargo = false;
    });

    // ── applyCoupon ──
    builder.addCase(applyCoupon.fulfilled, (state, action) => {
      state.couponCode = action.payload.code;
      state.couponDiscount = action.payload.discountPercent;
      state.kuponIndirimi = action.payload.kuponIndirimi;
      state.yeniToplam = action.payload.yeniToplam;
    });
    builder.addCase(applyCoupon.rejected, (state, action: any) => {
      state.error = action.payload;
    });
  },
});

// Selector'lar
export const cartItemSelectors = cartItemsAdapter.getSelectors(
  (state: RootState) => state.cart.cartItems,
);

export const selectAllCartItems = createSelector(
  (state: RootState) => state.cart.cartItems,
  (cartItems) => cartItemsAdapter.getSelectors().selectAll(cartItems),
);

export const selectCartItemCount = createSelector(selectAllCartItems, (items) =>
  items.reduce((acc, item) => acc + item.miktar, 0),
);

export const selectCartTotals = createSelector(
  (state: RootState) => state.cart.araToplam,
  (state: RootState) => state.cart.toplam,
  (state: RootState) => state.cart.kuponIndirimi,
  (state: RootState) => state.cart.yeniToplam,
  (state: RootState) => state.cart.couponCode,
  (state: RootState) => state.cart.couponDiscount,
  (state: RootState) => state.cart.hizliKargo,
  (
    araToplam,
    toplam,
    kuponIndirimi,
    yeniToplam,
    couponCode,
    couponDiscount,
    hizliKargo,
  ) => ({
    araToplam,
    toplam,
    kuponIndirimi,
    yeniToplam,
    couponCode,
    couponDiscount,
    hizliKargo,
  }),
);

// Item bazlı loading — sadece ilgili item'ın butonu disable olur
export const selectItemLoading = (urunId: number) =>
  createSelector(
    (state: RootState) => state.cart.loadingItems,
    (loadingItems) => !!loadingItems[urunId],
  );

export const {
  incrementItem,
  decrementItem,
  removeItemOptimistic,
  resetCoupon,
  setHizliKargo,
  resetCartState,
} = cartSlice.actions;
export default cartSlice.reducer;
