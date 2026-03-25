import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null
};
const fetchProjects = createAsyncThunk("projects/fetchProjects", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("/api/projects");
    return res.data.projects || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to fetch projects");
  }
});
const fetchProjectById = createAsyncThunk("projects/fetchProjectById", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/api/projects/${id}`);
    return res.data.project || res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to fetch project");
  }
});
const createProject = createAsyncThunk("projects/createProject", async (projectData, { rejectWithValue }) => {
  try {
    const res = await axios.post("/api/projects", projectData);
    return res.data.project;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to create project");
  }
});
const updateProject = createAsyncThunk("projects/updateProject", async ({ id, projectData }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`/api/projects/${id}`, projectData);
    return res.data.project;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to update project");
  }
});
const deleteProject = createAsyncThunk("projects/deleteProject", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/projects/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to delete project");
  }
});
const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProjects.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(fetchProjects.fulfilled, (state, action) => {
      state.projects = action.payload;
      state.loading = false;
    }).addCase(fetchProjects.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.projects = [];
    }).addCase(fetchProjectById.pending, (state) => {
      state.loading = true;
    }).addCase(fetchProjectById.fulfilled, (state, action) => {
      state.currentProject = action.payload;
      state.loading = false;
    }).addCase(createProject.fulfilled, (state, action) => {
      state.projects.unshift(action.payload);
    }).addCase(updateProject.fulfilled, (state, action) => {
      const index = state.projects.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) state.projects[index] = action.payload;
      if (state.currentProject && state.currentProject._id === action.payload._id) {
        state.currentProject = action.payload;
      }
    }).addCase(deleteProject.fulfilled, (state, action) => {
      state.projects = state.projects.filter((p) => p._id !== action.payload);
      state.loading = false;
    });
  }
});
const { clearCurrentProject } = projectSlice.actions;
var stdin_default = projectSlice.reducer;
export {
  clearCurrentProject,
  createProject,
  stdin_default as default,
  deleteProject,
  fetchProjectById,
  fetchProjects,
  updateProject
};
