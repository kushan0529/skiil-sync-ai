import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get('/api/projects');
    return res.data.projects;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch projects');
  }
});

export const fetchProjectById = createAsyncThunk('projects/fetchProjectById', async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/api/projects/${id}`);
    return res.data.project || res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch project');
  }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.projects = action.payload;
        state.loading = false;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.currentProject = action.payload;
        state.loading = false;
      });
  },
});

export const { clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
