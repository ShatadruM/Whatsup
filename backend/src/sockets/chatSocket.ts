import { Server, Socket } from 'socket.io';

export const configureSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // 1. User Setup: When a user logs in, they join a personal room using their User ID.
    // This allows us to send them targeted notifications (like a new chat invite).
    socket.on('setup', (userId: string) => {
      socket.join(userId);
      console.log(`User ${userId} is online and setup.`);
      socket.emit('connected');
    });

    // 2. Join Chat Room: When a user opens a specific chat interface.
    socket.on('join chat', (chatId: string) => {
      socket.join(chatId);
      console.log(`User joined room: ${chatId}`);
    });

    // 3. Real-time Messaging: When a user sends a message.
    socket.on('new message', (newMessage: any) => {
      const chatId = newMessage.chatId;

      // Broadcast the message to everyone in that specific chat room
      // `socket.to()` ensures the sender doesn't receive their own message back
      socket.to(chatId).emit('message received', newMessage);
    });

    // 4. Leave Chat Room: When a user closes the chat.
    socket.on('leave chat', (chatId: string) => {
      socket.leave(chatId);
      console.log(`User left room: ${chatId}`);
    });

    // 5. Cleanup on disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
    socket.on('message deleted', (deletedMessage: any) => {
  // Broadcast to the room so everyone's UI updates to "This message was deleted"
  socket.to(deletedMessage.chatId).emit('message deleted', deletedMessage);
});

socket.on('user kicked', ({ chatId, removedUserId }) => {
  // Notify the room that the roster has changed
  socket.to(chatId).emit('user kicked', { chatId, removedUserId });
});
  });
};