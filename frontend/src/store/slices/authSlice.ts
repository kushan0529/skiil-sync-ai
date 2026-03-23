import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  skills: string[];
  resumeUrl?: string;
  availabilityScore: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const initialState: AuthState = {
  user: null,
  token: token,
  isAuthenticated: !!token,
  loading: true,
  error: null,
};


export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const res = await axios.get('/api/users/me');
    return res.data.user as User;
  } catch (err: any) {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    return rejectWithValue(err.response?.data?.error || 'Auth check failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
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
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.loading = false;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { loginSuccess, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
