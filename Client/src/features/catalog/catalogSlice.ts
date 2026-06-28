import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { IProduct } from "../../model/IProduct";
import requests from "../../api/requests";
import { RootState } from "../../store/store";

// ürünleri getir
export const fetchProducts = createAsyncThunk<IProduct[]>(
    "catalog/fetchProducts",
    async () => {
        return await requests.Catalog.list();
    }
);

// tek ürün getir
export const fetchProductById = createAsyncThunk<IProduct, number>(
    "catalog/fetchProductById",
    async (productId) => {
        return await requests.Catalog.details(productId);
    }
);

const catalogAdapter = createEntityAdapter<IProduct>();

const initialState = catalogAdapter.getInitialState({
    status: "idle",
    isLoaded: false
});

export const catalogSlice = createSlice({
    name: "catalog",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchProducts.pending, (state) => {
            state.status = "loadingProducts";
        });

        builder.addCase(fetchProducts.fulfilled, (state, action) => {
            catalogAdapter.setAll(state, action.payload);
            state.isLoaded = true;
            state.status = "idle";
        });

        builder.addCase(fetchProducts.rejected, (state) => {
            state.status = "idle";
        });


        // DETAIL
        builder.addCase(fetchProductById.pending, (state) => {
            state.status = "loadingProduct";
        });

        builder.addCase(fetchProductById.fulfilled, (state, action) => {
            catalogAdapter.upsertOne(state, action.payload);
            state.status = "idle";
        });

        builder.addCase(fetchProductById.rejected, (state) => {
            state.status = "idle";
        });
    }

});

export const {
    selectAll: selectAllProducts,
    selectById: selectProductById,
    selectIds: selectProductIds,
    selectEntities: selectProductEntities,
    selectTotal: selectTotalProducts
} = catalogAdapter.getSelectors((state: RootState) => state.catalog);


export default catalogSlice.reducer;