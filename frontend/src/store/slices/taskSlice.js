import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  tasks: [],
  projectTasks: [],
  loading: false,
  error: null,
};

export const fetchAllTasks = createAsyncThunk('tasks/fetchAllTasks', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get('/api/tasks');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch tasks');
  }
});

export const fetchTasksByProjectId = createAsyncThunk('tasks/fetchByProject', async (projectId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/api/tasks/project/${projectId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch project tasks');
  }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    updateTaskStatusInState: (state, action) => {
      const task = state.tasks.find(t => t._id === action.payload.taskId);
      if (task) task.status = action.payload.status;
      
      const pTask = state.projectTasks.find(t => t._id === action.payload.taskId);
      if (pTask) pTask.status = action.payload.status;
    },
    addWorkLogToState: (state, action) => {
      const task = state.tasks.find(t => t._id === action.payload.taskId);
      if (task) {
        if (!task.workLogs) task.workLogs = [];
        task.workLogs.push(action.payload.log);
      }
      const pTask = state.projectTasks.find(t => t._id === action.payload.taskId);
      if (pTask) {
        if (!pTask.workLogs) pTask.workLogs = [];
        pTask.workLogs.push(action.payload.log);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchTasksByProjectId.fulfilled, (state, action) => {
        state.projectTasks = action.payload;
        state.loading = false;
      });
  },
});

export const { updateTaskStatusInState, addWorkLogToState } = taskSlice.actions;
export default taskSlice.reducer;
