import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import requests from "../../api/requests";
import { IBlog } from "../../model/IBlog";
import { RootState } from "../../store/store";

// blogları getir
export const fetchBlogs = createAsyncThunk("blog/fetchBlogs", async () => {
  const res = await requests.Blogs.getAll();
  return res;
});

// tek blog getir
export const fetchBlogById = createAsyncThunk(
  "blog/fetchBlogById",
  async (id: number) => {
    const res = await requests.Blogs.getById(id);
    return res;
  },
);

const blogAdapter = createEntityAdapter<IBlog>();

const initialState = blogAdapter.getInitialState({
  listStatus: "idle",
  detailStatus: "idle",
  isLoaded: false,
});

export const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBlogs.pending, (state) => {
      state.listStatus = "loading";
    });

    builder.addCase(fetchBlogs.fulfilled, (state, action) => {
      blogAdapter.setAll(state, action.payload ?? []);
      state.listStatus = "succeeded";
      state.isLoaded = true;
    });

    builder.addCase(fetchBlogs.rejected, (state) => {
      state.listStatus = "failed";
    });


    builder.addCase(fetchBlogById.pending, (state) => {
      state.detailStatus = "loading";
    });

    builder.addCase(fetchBlogById.fulfilled, (state, action) => {
      blogAdapter.upsertOne(state, action.payload);
      state.detailStatus = "succeeded";
    });

    builder.addCase(fetchBlogById.rejected, (state) => {
      state.detailStatus = "failed";
    });
  },
});

export const {
  selectAll: selectAllBlogs,
  selectById: selectBlogById,
  selectIds: selectBlogIds,
  selectEntities: selectBlogEntities,
  selectTotal: selectTotalBlogs,
} =  blogAdapter.getSelectors((state: RootState) => state.blog);

export default blogSlice;
