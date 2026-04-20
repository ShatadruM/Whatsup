import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 1. Define Types
export interface Message {
  _id: string;
  chatId: string;
  content: string;
  senderId: { _id: string; username: string };
  isDeleted: boolean;
  timestamp: string;
}

export interface Chat {
  id: string; 
  _id: string;
  type: '1:1' | 'group';
  chatName?: string;
  participants: any[];
  updatedAt: string;
}

interface ChatState {
  conversations: Chat[];
  activeConversation: Chat | null;
  activeMessages: Message[];
}

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  activeMessages: [],
};

// 2. Create the Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Chat[]>) => {
      // Map MongoDB _id to id for your Sidebar component
      state.conversations = action.payload.map(chat => ({ ...chat, id: chat._id }));
    },
    setActiveConversation: (state, action: PayloadAction<Chat | null>) => {
      state.activeConversation = action.payload;
    },
    setActiveMessages: (state, action: PayloadAction<Message[]>) => {
      state.activeMessages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      // Only append if the message belongs to the currently open chat
      if (state.activeConversation && action.payload.chatId === state.activeConversation._id) {
        state.activeMessages.push(action.payload);
      }
    },
    updateMessageAsDeleted: (state, action: PayloadAction<string>) => {
      const messageId = action.payload;
      const message = state.activeMessages.find(msg => msg._id === messageId);
      if (message) {
        message.isDeleted = true;
        message.content = "This message was deleted";
      }
    },
    addConversation: (state, action: PayloadAction<Chat>) => {
  // Check if it's already in the sidebar to prevent duplicates
  const exists = state.conversations.find(c => c.id === action.payload._id);
  if (!exists) {
    // Add the new chat to the top of the list and map the _id
    state.conversations.unshift({ ...action.payload, id: action.payload._id });
  }
},
  },
});

export const { 
  setConversations, 
  setActiveConversation, 
  setActiveMessages, 
  addMessage, 
  updateMessageAsDeleted 
} = chatSlice.actions;

export default chatSlice.reducer;