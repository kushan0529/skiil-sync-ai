import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: true,
  error: null,
};

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const res = await axios.get('/api/users/me');
    return res.data.user;
  } catch (err) {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    return rejectWithValue(err.response?.data?.error || 'Auth check failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.loading = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export const { loginSuccess, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
