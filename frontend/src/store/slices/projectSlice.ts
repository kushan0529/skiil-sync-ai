import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface ProjectState {
  projects: any[];
  currentProject: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get('/api/projects');
    return res.data.projects;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch projects');
  }
});

export const fetchProjectById = createAsyncThunk('projects/fetchProjectById', async (id: string, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/api/projects/${id}`);
    return res.data.project || res.data;
  } catch (err: any) {
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
        state.error = action.payload as string;
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
