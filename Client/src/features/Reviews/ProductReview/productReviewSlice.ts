import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import requests from "../../../api/requests";
import { IProductReview } from "../../../model/IProductReview";

interface ReviewState {
    reviews: IProductReview[];
    loading: boolean;
    error: string | null;
}

const initialState: ReviewState = {
    reviews: [],
    loading: false,
    error: null
};


// GET REVIEWS
export const getReviewsByProduct = createAsyncThunk(
    "review/getReviewsByProduct",
    async (productId: number, thunkAPI) => {
        try {
            return await requests.Review.getByProduct(productId);
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);


// CREATE REVIEW
export const createReview = createAsyncThunk(
    "review/createReview",
    async (
        data: {
            productId: number;
            text: string;
            rating: number;
        },
        thunkAPI
    ) => {
        try {
            return await requests.Review.create(data);
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);


// UPDATE REVIEW
export const updateReview = createAsyncThunk(
    "review/updateReview",
    async (
        {
            id,
            data
        }: {
            id: number;
            data: {
                text: string;
                rating: number;
            };
        },
        thunkAPI
    ) => {
        try {
            return await requests.Review.update(id, data);
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);


// DELETE REVIEW
export const deleteReview = createAsyncThunk(
    "review/deleteReview",
    async (id: number, thunkAPI) => {
        try {
            await requests.Review.delete(id);

            return id;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);


const productReviewSlice = createSlice({
    name: "review",
    initialState,
    reducers: {},

    extraReducers: (builder) => {

        // GET
        builder.addCase(getReviewsByProduct.pending, (state) => {
            state.loading = true;
            state.error = null;
        });

        builder.addCase(getReviewsByProduct.fulfilled, (state, action) => {
            state.loading = false;
            state.reviews = action.payload;
        });

        builder.addCase(getReviewsByProduct.rejected, (state, action: any) => {
            state.loading = false;
            state.error = action.payload;
        });


        // CREATE
        builder.addCase(createReview.fulfilled, (state, action) => {
            state.reviews.unshift(action.payload);
        });


        // UPDATE
        builder.addCase(updateReview.fulfilled, (state, action) => {

            const index = state.reviews.findIndex(
                x => x.id === action.payload.id
            );

            if (index !== -1) {
                state.reviews[index] = action.payload;
            }
        });


        // DELETE
        builder.addCase(deleteReview.fulfilled, (state, action) => {

            state.reviews = state.reviews.filter(
                x => x.id !== action.payload
            );
        });
    }
});

export default productReviewSlice.reducer;