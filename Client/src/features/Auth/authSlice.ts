import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import requests from "../../api/requests";
import { FieldValues } from "react-hook-form";
import { IUser } from "../../model/IUser";

// STATE
interface AuthState {
  user: IUser | null;
  roles: string[];
  isAuthenticated: boolean;
  status: "idle" | "loading" | "ready";
  loginLoading: boolean;
  registerLoading: boolean;
}

// INITIAL STATE
const initialState: AuthState = {
  user: null,
  roles: [],
  isAuthenticated: false,
  status: "loading",
  loginLoading: false,
  registerLoading: false,
};

export const getUser = createAsyncThunk("auth/getUser", async (_, thunkAPI) => {
  try {
    const user = await requests.Auth.getUser();
    if (!user) return thunkAPI.rejectWithValue(null);
    return user;
  } catch {
    return thunkAPI.rejectWithValue(null);
  }
});

export type LoginError = {
  status: number;
  message: string;
};

export const loginUser = createAsyncThunk<
  IUser,
  FieldValues,
  { rejectValue: LoginError }
>("auth/loginUser", async (data, { rejectWithValue }) => {
  try {
    await requests.Auth.login(data);
    const user = await requests.Auth.getUser();
    if (!user) {
      return rejectWithValue({
        status: 0,
        message: "Giriş yapılamadı. Lütfen tekrar deneyin.",
      });
    }
    return user;
  } catch (error: any) {
    if (Array.isArray(error)) {
      return rejectWithValue({
        status: 400,
        message: error[0] ?? "Kullanıcı adı ve şifre zorunludur.",
      });
    }

    return rejectWithValue({
      status: error?.response?.status ?? 0,
      message:
        error?.response?.data?.message ??
        "Giriş yapılamadı. Lütfen tekrar deneyin.",
    });
  }
});

export const registerUser = createAsyncThunk<void, FieldValues>(
  "auth/registerUser",
  async (data, { rejectWithValue }) => {
    try {
      await requests.Auth.register(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Kayıt Başarısız oldu");
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await requests.Auth.logout();
});

// SLICE
export const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    updateAvatar(state, action: { payload: string }) {
      if (state.user) {
        state.user.avatar = action.payload;
      }
    },
    updateProfile(
      state,
      action: { payload: { fullName: string; email: string } },
    ) {
      if (state.user) {
        state.user.fullName = action.payload.fullName;
        state.user.email = action.payload.email;
      }
    },
  },

  extraReducers: (builder) => {
    builder.addCase(loginUser.pending, (state) => {
      state.loginLoading = true;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loginLoading = false;
      state.user = action.payload;
      state.roles = action.payload.roles;
      state.isAuthenticated = true;
      state.status = "ready";
    });
    builder.addCase(loginUser.rejected, (state) => {
      state.loginLoading = false;
    });

    builder.addCase(registerUser.pending, (state) => {
      state.registerLoading = true;
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.registerLoading = false;
    });
    builder.addCase(registerUser.rejected, (state) => {
      state.registerLoading = false;
    });

    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.roles = [];
      state.isAuthenticated = false;
      state.status = "ready";
    });

    builder.addCase(getUser.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(getUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.roles = action.payload.roles;
      state.isAuthenticated = true;
      state.status = "ready";
    });
    builder.addCase(getUser.rejected, (state) => {
      state.user = null;
      state.roles = [];
      state.isAuthenticated = false;
      state.status = "ready";
    });
  },
});

export const { updateAvatar, updateProfile } = authSlice.actions;
export default authSlice.reducer;
