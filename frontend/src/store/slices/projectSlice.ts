import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: any;
  members: any[];
  requiredSkills: string[];
  status: string;
  progress: number;
  startDate?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
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
    // Ensure we return an array
    return (res.data.projects || []) as Project[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch projects');
  }
});

export const fetchProjectById = createAsyncThunk('projects/fetchProjectById', async (id: string, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/api/projects/${id}`);
    return (res.data.project || res.data) as Project;
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
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.projects = action.payload;
        state.loading = false;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
        state.projects = []; // Ensure projects is an array even on error
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjectById.fulfilled, (state, action: PayloadAction<Project>) => {
        state.currentProject = action.payload;
        state.loading = false;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const { clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
