import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const initialState = {
  tasks: [],
  projectTasks: [],
  loading: false,
  error: null
};
const fetchAllTasks = createAsyncThunk("tasks/fetchAllTasks", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("/api/tasks");
    return res.data.tasks;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to fetch tasks");
  }
});
const fetchTasksByProjectId = createAsyncThunk("tasks/fetchTasksByProjectId", async (projectId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/api/tasks/project/${projectId}`);
    return res.data.tasks;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to fetch tasks for project");
  }
});
const createTask = createAsyncThunk("tasks/createTask", async (taskData, { rejectWithValue }) => {
  try {
    const res = await axios.post("/api/tasks", taskData);
    return res.data; // Return full data including mailStatus
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to create task");
  }
});
const updateTask = createAsyncThunk("tasks/updateTask", async ({ taskId, taskData }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`/api/tasks/${taskId}`, taskData);
    return res.data; // Return full data including mailStatus
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to update task");
  }
});
const deleteTask = createAsyncThunk("tasks/deleteTask", async (taskId, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/tasks/${taskId}`);
    return taskId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to delete task");
  }
});
const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    updateTaskStatusInState: (state, action) => {
      const { taskId, status } = action.payload;
      const task = state.tasks.find((t) => t._id === taskId);
      if (task) task.status = status;
      const projectTask = state.projectTasks.find((t) => t._id === taskId);
      if (projectTask) projectTask.status = status;
    },
    updateTaskProgressInState: (state, action) => {
      const { taskId, progress, status } = action.payload;
      const task = state.tasks.find((t) => t._id === taskId);
      if (task) {
        task.progress = progress;
        if (status) task.status = status;
      }
      const projectTask = state.projectTasks.find((t) => t._id === taskId);
      if (projectTask) {
        projectTask.progress = progress;
        if (status) projectTask.status = status;
      }
    },
    addWorkLogToState: (state, action) => {
      const { taskId, log } = action.payload;
      const task = state.tasks.find((t) => t._id === taskId);
      if (task) {
        if (!task.workLogs) task.workLogs = [];
        task.workLogs.push(log);
      }
      const projectTask = state.projectTasks.find((t) => t._id === taskId);
      if (projectTask) {
        if (!projectTask.workLogs) projectTask.workLogs = [];
        projectTask.workLogs.push(log);
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAllTasks.pending, (state) => {
      state.loading = true;
    }).addCase(fetchAllTasks.fulfilled, (state, action) => {
      state.tasks = action.payload;
      state.loading = false;
    }).addCase(fetchTasksByProjectId.pending, (state) => {
      state.loading = true;
    }).addCase(fetchTasksByProjectId.fulfilled, (state, action) => {
      state.projectTasks = action.payload;
      state.loading = false;
    }).addCase(createTask.fulfilled, (state, action) => {
      const task = action.payload.task || action.payload;
      state.tasks.unshift(task);
      state.projectTasks.unshift(task);
    }).addCase(updateTask.fulfilled, (state, action) => {
      const updatedTask = action.payload.task || action.payload;
      if (!updatedTask || !updatedTask._id) return;
      const index = state.tasks.findIndex((t) => t && t._id === updatedTask._id);
      if (index !== -1) state.tasks[index] = updatedTask;
      const projectIndex = state.projectTasks.findIndex((t) => t && t._id === updatedTask._id);
      if (projectIndex !== -1) state.projectTasks[projectIndex] = updatedTask;
    }).addCase(deleteTask.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload);
      state.projectTasks = state.projectTasks.filter((t) => t._id !== action.payload);
    });
  }
});
const { updateTaskStatusInState, updateTaskProgressInState, addWorkLogToState } = taskSlice.actions;
var stdin_default = taskSlice.reducer;
export {
  addWorkLogToState,
  createTask,
  stdin_default as default,
  deleteTask,
  fetchAllTasks,
  fetchTasksByProjectId,
  updateTask,
  updateTaskProgressInState,
  updateTaskStatusInState
};
