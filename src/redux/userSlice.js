import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosConfig';
import toast from 'react-hot-toast';

const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const updateUserById = createAsyncThunk(
  'users/updateUserById',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUserById = createAsyncThunk(
  'users/deleteUserById',
  async (userId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/users/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // Update user
    builder
      .addCase(updateUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex((user) => user.userId === action.payload.userId);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.selectedUser = action.payload;
        toast.success('User updated successfully');
      })
      .addCase(updateUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // Delete user
    builder
      .addCase(deleteUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user.userId !== action.payload);
        toast.success('User deleted successfully');
      })
      .addCase(deleteUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

// Export actions
export const { clearSelectedUser, clearError } = userSlice.actions;

// Export selectors
export const selectAllUsers = (state) => state.users.users;
export const selectSelectedUser = (state) => state.users.selectedUser;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;

// Export reducer
export default userSlice.reducer;