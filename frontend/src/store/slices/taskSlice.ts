import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  preference: 'low' | 'medium' | 'high';
  project?: any;
  assignee?: any;
  progress: number;
  startDate?: string;
  deadline?: string;
  workLogs?: any[];
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

export const createTask = createAsyncThunk('tasks/createTask', async (taskData: any, { rejectWithValue }) => {
  try {
    const res = await axios.post('/api/tasks', taskData);
    return res.data.task as Task;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk('tasks/updateTask', async ({ taskId, taskData }: { taskId: string; taskData: any }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`/api/tasks/${taskId}`, taskData);
    return res.data.task as Task;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update task');
  }
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (taskId: string, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/tasks/${taskId}`);
    return taskId;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete task');
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
    updateTaskProgressInState: (state, action: PayloadAction<{ taskId: string; progress: number; status: string }>) => {
      const { taskId, progress, status } = action.payload;
      const task = state.tasks.find(t => t._id === taskId);
      if (task) {
        task.progress = progress;
        task.status = status as any;
      }
      const projectTask = state.projectTasks.find(t => t._id === taskId);
      if (projectTask) {
        projectTask.progress = progress;
        projectTask.status = status as any;
      }
    },
    addWorkLogToState: (state, action: PayloadAction<{ taskId: string; log: any }>) => {
      const { taskId, log } = action.payload;
      const task = state.tasks.find(t => t._id === taskId);
      if (task) {
        if (!task.workLogs) task.workLogs = [];
        task.workLogs.push(log);
      }
      const projectTask = state.projectTasks.find(t => t._id === taskId);
      if (projectTask) {
        if (!projectTask.workLogs) projectTask.workLogs = [];
        projectTask.workLogs.push(log);
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
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        if (!action.payload || !action.payload._id) return;
        
        const index = state.tasks.findIndex(t => t && t._id === action.payload._id);
        if (index !== -1) state.tasks[index] = action.payload;
        
        const projectIndex = state.projectTasks.findIndex(t => t && t._id === action.payload._id);
        if (projectIndex !== -1) state.projectTasks[projectIndex] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
        state.projectTasks = state.projectTasks.filter(t => t._id !== action.payload);
      });
  },
});

export const { updateTaskStatusInState, addWorkLogToState } = taskSlice.actions;
export default taskSlice.reducer;
