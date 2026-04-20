  import { useEffect, useState, useCallback } from 'react';
  import { io, Socket } from 'socket.io-client';
  import axios from 'axios';
  import { useAppDispatch, useAppSelector } from '../store/hooks';
  import { 
    setConversations, 
    setActiveConversation, 
    setActiveMessages, 
    addMessage, 
    updateMessageAsDeleted,
    addConversation,
    Chat 
  } from '../store/features/chatSlice';

  const ENDPOINT = 'http://localhost:5000'; // Make sure this matches your Express server port

  export function useChat() {
    const dispatch = useAppDispatch();
    
    // Pulling global state from Redux
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const { conversations, activeConversation, activeMessages } = useAppSelector((state) => state.chat);
    
    const [socket, setSocket] = useState<Socket | null>(null);

    // 1. Establish Socket Connection on Login
    useEffect(() => {
      if (isAuthenticated && user) {
        const newSocket = io(ENDPOINT);
        setSocket(newSocket);

        newSocket.on('connect', () => {
      console.log('Connected to socket server');
      // CHANGE THIS LINE:
      newSocket.emit('setup', user._id); 
    });

        return () => {
          newSocket.disconnect();
        };
      }
    }, [isAuthenticated, user]);

  

    // 2. Fetch Initial Conversations (Sidebar Data)
    useEffect(() => {
      if (isAuthenticated) {
        const fetchChats = async () => {
          try {
            const { data } = await axios.get(`${ENDPOINT}/api/chats`);
            dispatch(setConversations(data));
          } catch (error) {
            console.error("Failed to fetch chats", error);
          }
        };
        fetchChats();
      }
    }, [isAuthenticated, dispatch]);

    // 3. Handle Active Conversation Logic (Fetch Messages & Listen for Real-time Updates)
    useEffect(() => {
      if (!activeConversation || !socket) return;

      // Join the specific room for this chat
      socket.emit('join chat', activeConversation._id);

      // Fetch message history from MongoDB
      const fetchMessages = async () => {
        try {
          const { data } = await axios.get(`${ENDPOINT}/api/messages/${activeConversation._id}`);
          dispatch(setActiveMessages(data));
        } catch (error) {
          console.error("Failed to fetch messages", error);
        }
      };
      fetchMessages();

      // Setup real-time socket listeners
     const handleNewMessage = (newMessage: any) => {
        // CHANGE THIS LINE:
        if (newMessage.senderId._id !== user?._id) {
          dispatch(addMessage(newMessage));
        }
      };

      const handleMessageDeleted = (deletedMessage: any) => {
        dispatch(updateMessageAsDeleted(deletedMessage._id));
      };

      socket.on('message received', handleNewMessage);
      socket.on('message deleted', handleMessageDeleted);

      // Cleanup: Leave room and remove listeners when switching chats
      return () => {
        socket.emit('leave chat', activeConversation._id);
        socket.off('message received', handleNewMessage);
        socket.off('message deleted', handleMessageDeleted);
      };
    }, [activeConversation, socket, dispatch]);

    // 4. UI Actions
    
    // Note: Adjusting the parameter to accept the ID or the full Chat object based on how your Sidebar triggers it
    const selectConversation = useCallback((conversationIdOrObject: string | Chat) => {
      let chatToSelect: Chat | undefined;
      
      if (typeof conversationIdOrObject === 'string') {
        chatToSelect = conversations.find(c => c._id === conversationIdOrObject);
      } else {
        chatToSelect = conversationIdOrObject as Chat;
      }

      if (chatToSelect) {
        dispatch(setActiveConversation(chatToSelect));
      }
    }, [conversations, dispatch]);

    const startDirectMessage = async (email: string) => {
    if (!email.trim() || !user) return { error: 'Please enter an email' };

    try {
      // 1. Search for the user by email
      const searchRes = await axios.get(`${ENDPOINT}/api/users?search=${email}`);
      
      // If array is empty, user doesn't exist
      if (searchRes.data.length === 0) {
        return { error: 'User not found' };
      }

      const targetUser = searchRes.data[0];

      // 2. Create or fetch the 1:1 chat room with this user
      const chatRes = await axios.post(`${ENDPOINT}/api/chats`, {
        participantId: targetUser._id,
        isGroup: false
      });

      const newChat = chatRes.data;

      // 3. Update Redux state
      // import addConversation at the top of useChat!
      dispatch(addConversation(newChat)); 
      dispatch(setActiveConversation(newChat));

      return { success: true };
    } catch (error) {
      console.error("Failed to start chat", error);
      return { error: 'An error occurred while creating the chat' };
    }
  };

    const sendMessage = useCallback(async (text: string) => {
      if (!text.trim() || !activeConversation || !socket) return;

      try {
        // 1. Save to MongoDB via API
        const { data } = await axios.post(`${ENDPOINT}/api/messages`, {
          content: text,
          chatId: activeConversation._id,
        });

        // 2. Update Redux immediately so the UI feels instant
        dispatch(addMessage(data));

        // 3. Broadcast to other users in the room
        socket.emit('new message', data);
        
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }, [activeConversation, socket, dispatch]);

    return {
      conversations,
      activeConversation,
      activeMessages,
      selectConversation,
      sendMessage,
      startDirectMessage,
    };
  }