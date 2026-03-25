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
const { removeUserFromState } = userSlice.actions;
var stdin_default = userSlice.reducer;
export {
  stdin_default as default,
  fetchUsers,
  removeUserFromState
};
