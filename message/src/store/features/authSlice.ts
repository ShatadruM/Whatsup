import { createSlice, PayloadAction } from '@reduxjs/toolkit';


// 1. Define the shapes of our state
interface User {
  id: string;
  username: string;
  email: string;
  status: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Message {
  _id: string;
  chatId: string;
  content: string;
  senderId: { _id: string; username: string };
  isDeleted: boolean;
  timestamp: string;
}

export interface Chat {
  id: string; // Mapping MongoDB _id to id for the UI
  _id: string;
  type: '1:1' | 'group';
  chatName?: string;
  participants: any[];
  updatedAt: string;
}

// 2. Load initial state from local storage (if it exists)
const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedUser && !!storedToken,
};

// 3. Create the slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // PayloadAction<T> enforces that the data passed into the action matches the type T
    setCredentials: (
      state, 
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      
      // Persist to local storage
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});



export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;