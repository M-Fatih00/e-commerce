import {
  createAsyncThunk,
  createSlice,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";
import { ICartItem } from "../../model/ICart";
import requests from "../../api/requests";
import { RootState } from "../../store/store";

const cartItemsAdapter = createEntityAdapter<ICartItem, number>({
  selectId: (item) => item.cartItemId,
});

export interface CartState {
  cartId: number | null;
  araToplam: number;
  urunIndirimi: number;
  toplam: number;
  kargoUcreti: number;
  hizliKargoUcreti: number;
  ucretsizKargoLimiti: number;
  loadingItems: Record<number, boolean>;
  initialLoading: boolean;
  error: string | null;
  cartItems: ReturnType<typeof cartItemsAdapter.getInitialState>;
  couponCode: string | null;
  couponDiscount: number;
  hizliKargo: boolean;
}

const initialState: CartState = {
  cartId: null,
  araToplam: 0,
  urunIndirimi: 0,
  toplam: 0,
  kargoUcreti: 0,
  hizliKargoUcreti: 0,
  ucretsizKargoLimiti: 0,
  loadingItems: {},
  initialLoading: false,
  error: null,
  cartItems: cartItemsAdapter.getInitialState(),
  couponCode: null,
  couponDiscount: 0,
  hizliKargo: false,
};

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const loadCartIntoState = (state: CartState, payload: any) => {
  state.cartId = payload?.cartId ?? null;
  state.araToplam = payload?.araToplam ?? 0;
  state.urunIndirimi = payload?.urunIndirimi ?? 0;
  state.toplam = payload?.toplam ?? 0;
  state.kargoUcreti = payload?.kargoUcreti ?? 0;
  state.hizliKargoUcreti = payload?.hizliKargoUcreti ?? 0;
  state.ucretsizKargoLimiti = payload?.ucretsizKargoLimiti ?? 0;
  cartItemsAdapter.setAll(state.cartItems, payload?.cartItems ?? []);
};

const clearCartState = (state: CartState) => {
  cartItemsAdapter.removeAll(state.cartItems);
  state.cartId = null;
  state.araToplam = 0;
  state.urunIndirimi = 0;
  state.toplam = 0;
  state.hizliKargo = false;
  state.couponCode = null;
  state.couponDiscount = 0;
};

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
    { urunId, miktar = 1, beden, renk }: { urunId: number; miktar?: number; beden?: string; renk?: string },
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
    }: { urunId: number; miktar?: number; beden?: string | null; renk?: string | null },
    thunkAPI,
  ) => {
    try {
      return await requests.Cart.removeItem(urunId, miktar, beden, renk);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ urunId, error: error.response?.data });
    }
  },
);

export const clearCart = createAsyncThunk("cart/clearCart", async (_, thunkAPI) => {
  try {
    return await requests.Cart.clear();
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data);
  }
});

export const applyCoupon = createAsyncThunk("cart/applyCoupon", async (code: string, thunkAPI) => {
  try {
    return await requests.Coupon.apply(code);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data);
  }
});

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    removeItemOptimistic(state, action: { payload: { cartItemId: number } }) {
      cartItemsAdapter.removeOne(state.cartItems, action.payload.cartItemId);
    },
    resetCoupon(state) {
      state.couponCode = null;
      state.couponDiscount = 0;
    },
    resetCartState(state) {
      clearCartState(state);
    },
    setHizliKargo(state, action: { payload: boolean }) {
      state.hizliKargo = action.payload;
    },
  },

  extraReducers(builder) {
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

    builder.addCase(addItem.pending, (state, action) => {
      state.loadingItems[action.meta.arg.urunId] = true;
    });
    builder.addCase(addItem.fulfilled, (state, action) => {
      delete state.loadingItems[action.meta.arg.urunId];
      loadCartIntoState(state, action.payload);
    });
    builder.addCase(addItem.rejected, (state, action: any) => {
      delete state.loadingItems[action.meta.arg.urunId];
      state.error = action.payload?.error;
    });

    builder.addCase(removeItem.pending, (state, action) => {
      state.loadingItems[action.meta.arg.urunId] = true;
    });
    builder.addCase(removeItem.fulfilled, (state, action) => {
      delete state.loadingItems[action.meta.arg.urunId];
      loadCartIntoState(state, action.payload);
    });
    builder.addCase(removeItem.rejected, (state, action: any) => {
      delete state.loadingItems[action.meta.arg.urunId];
      state.error = action.payload?.error;
    });

    builder.addCase(clearCart.fulfilled, (state) => {
      clearCartState(state);
    });

    builder.addCase(applyCoupon.fulfilled, (state, action) => {
      state.couponCode = action.payload.code;
      state.couponDiscount = action.payload.discountPercent;
    });
    builder.addCase(applyCoupon.rejected, (state, action: any) => {
      state.error = action.payload;
    });
  },
});

export const cartItemSelectors = cartItemsAdapter.getSelectors((state: RootState) => state.cart.cartItems);

export const selectAllCartItems = createSelector(
  (state: RootState) => state.cart.cartItems,
  (cartItems) => cartItemsAdapter.getSelectors().selectAll(cartItems),
);

export const selectCartItemCount = createSelector(selectAllCartItems, (items) =>
  items.reduce((acc, item) => acc + item.miktar, 0),
);

export const selectCartTotals = createSelector(
  (state: RootState) => state.cart,
  (cart) => {
    const kuponIndirimi = cart.couponCode ? roundMoney((cart.toplam * cart.couponDiscount) / 100) : 0;
    const kargo = cart.hizliKargo ? cart.hizliKargoUcreti : cart.kargoUcreti;

    return {
      araToplam: cart.araToplam,
      urunIndirimi: cart.urunIndirimi,
      toplam: cart.toplam,
      couponCode: cart.couponCode,
      couponDiscount: cart.couponDiscount,
      kuponIndirimi,
      hizliKargo: cart.hizliKargo,
      kargoUcreti: cart.kargoUcreti,
      hizliKargoUcreti: cart.hizliKargoUcreti,
      ucretsizKargoLimiti: cart.ucretsizKargoLimiti,
      kargo,
      genelToplam: roundMoney(cart.toplam - kuponIndirimi + kargo),
    };
  },
);

export const selectItemLoading = (urunId: number) =>
  createSelector(
    (state: RootState) => state.cart.loadingItems,
    (loadingItems) => !!loadingItems[urunId],
  );

export const { removeItemOptimistic, resetCoupon, setHizliKargo, resetCartState } = cartSlice.actions;
export default cartSlice.reducer;