import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  project: any;
  assignee: any;
  progress: number;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskState {
  tasks: Task[];
  projectTasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  projectTasks: [],
  loading: false,
  error: null,
};

export const fetchAllTasks = createAsyncThunk('tasks/fetchAllTasks', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get('/api/tasks');
    return res.data.tasks as Task[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch tasks');
  }
});

export const fetchTasksByProjectId = createAsyncThunk('tasks/fetchTasksByProjectId', async (projectId: string, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/api/tasks/project/${projectId}`);
    return res.data.tasks as Task[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch tasks for project');
  }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    updateTaskStatusInState: (state, action: PayloadAction<{ taskId: string; status: string }>) => {
      const { taskId, status } = action.payload;
      const task = state.tasks.find(t => t._id === taskId);
      if (task) task.status = status as any;
      const projectTask = state.projectTasks.find(t => t._id === taskId);
      if (projectTask) projectTask.status = status as any;
    },
    addWorkLogToState: (state, action: PayloadAction<{ taskId: string; log: any }>) => {
      const { taskId, log } = action.payload;
      const task = state.tasks.find(t => t._id === taskId);
      if (task) {
        if (!task.workLogs) (task as any).workLogs = [];
        (task as any).workLogs.push(log);
      }
      const projectTask = state.projectTasks.find(t => t._id === taskId);
      if (projectTask) {
        if (!(projectTask as any).workLogs) (projectTask as any).workLogs = [];
        (projectTask as any).workLogs.push(log);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.tasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchTasksByProjectId.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasksByProjectId.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.projectTasks = action.payload;
        state.loading = false;
      });
  },
});

export const { updateTaskStatusInState, addWorkLogToState } = taskSlice.actions;
export default taskSlice.reducer;
