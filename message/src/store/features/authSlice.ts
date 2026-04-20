import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types'; // Make sure this path is correct

// 1. Check localStorage the moment the file is loaded
const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// 2. Set the initial state based on what we found in localStorage
const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken ? storedToken : null,
  isAuthenticated: !!storedToken, // Evaluates to true if a token exists
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      // Update Redux state
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      // 3. Save to localStorage so it survives a refresh
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      // Clear Redux state
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // 4. Remove from localStorage when they explicitly log out
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;