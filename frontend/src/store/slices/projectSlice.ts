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

export const createProject = createAsyncThunk('projects/createProject', async (projectData: any, { rejectWithValue }) => {
  try {
    const res = await axios.post('/api/projects', projectData);
    return res.data.project as Project;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to create project');
  }
});

export const updateProject = createAsyncThunk('projects/updateProject', async ({ id, projectData }: { id: string; projectData: any }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`/api/projects/${id}`, projectData);
    return res.data.project as Project;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update project');
  }
});

export const deleteProject = createAsyncThunk('projects/deleteProject', async (id: string, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/projects/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete project');
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
        state.projects = [];
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjectById.fulfilled, (state, action: PayloadAction<Project>) => {
        state.currentProject = action.payload;
        state.loading = false;
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.projects.unshift(action.payload);
      })
      .addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
        const index = state.projects.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.projects[index] = action.payload;
        if (state.currentProject && state.currentProject._id === action.payload._id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
        state.projects = state.projects.filter(p => p._id !== action.payload);
        state.loading = false;
      });
  },
});

export const { clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
