import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const initialState = {
  users: [],
  loading: false,
  error: null
};
const fetchUsers = createAsyncThunk("users/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("/api/users");
    return res.data.users;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to fetch users");
  }
});
const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    removeUserFromState: (state, action) => {
      state.users = state.users.filter((user) => user._id !== action.payload);
    },
    approveUserInState: (state, action) => {
      const user = state.users.find((u) => u._id === action.payload);
      if (user) {
        user.isApproved = true;
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => {
      state.loading = true;
    }).addCase(fetchUsers.fulfilled, (state, action) => {
      state.users = action.payload;
      state.loading = false;
    }).addCase(fetchUsers.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
  }
});
const { removeUserFromState, approveUserInState } = userSlice.actions;
var stdin_default = userSlice.reducer;
export {
  stdin_default as default,
  fetchUsers,
  removeUserFromState,
  approveUserInState
};
