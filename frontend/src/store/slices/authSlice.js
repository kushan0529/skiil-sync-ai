import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
const initialState = {
  user: null,
  token,
  isAuthenticated: !!token,
  loading: true,
  error: null
};
const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  const token2 = localStorage.getItem("token");
  if (!token2) return null;
  try {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token2}`;
    const res = await axios.get("/api/users/me");
    return res.data.user;
  } catch (err) {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    return rejectWithValue(err.response?.data?.error || "Auth check failed");
  }
});
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { token: token2, user } = action.payload;
      state.token = token2;
      state.user = user;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem("token", token2);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token2}`;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(checkAuth.pending, (state) => {
      state.loading = true;
    }).addCase(checkAuth.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    }).addCase(checkAuth.rejected, (state, action) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = action.payload;
    });
  }
});
const { loginSuccess, logout, setLoading } = authSlice.actions;
var stdin_default = authSlice.reducer;
export {
  checkAuth,
  stdin_default as default,
  loginSuccess,
  logout,
  setLoading
};
