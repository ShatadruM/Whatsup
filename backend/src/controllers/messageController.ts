import { Response } from 'express';
import Message from '../models/Message';
import Chat from '../models/Chat';
import { AuthRequest } from '../middleware/authMiddleware';

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;

    // Verify the chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    // Fetch all messages for this chat
    const messages = await Message.find({ chatId })
      .populate('senderId', 'username')
      .sort({ timestamp: 1 }); // Oldest to newest for chat UI flow

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching messages', error });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, chatId } = req.body;
    const currentUserId = req.user?.userId;

    if (!currentUserId || !content || !chatId) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Create and save the message
    const newMessage = new Message({
      chatId,
      senderId: currentUserId,
      content,
      status: 'sent'
    });

    await newMessage.save();

    // Update the chat's updatedAt timestamp to bring it to the top of the chat list
    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    // Populate sender details before returning
    const populatedMessage = await newMessage.populate('senderId', 'username');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error sending message', error });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user?.userId;

    const message = await Message.findById(messageId).populate('chatId');

    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    const chat = message.chatId as any;

    // Check permissions: Sender can delete their own, or Group Admin can delete any
    const isSender = message.senderId.toString() === currentUserId;
    const isAdmin = chat.type === 'group' && chat.groupAdmins.includes(currentUserId);

    if (!isSender && !isAdmin) {
      res.status(403).json({ message: 'Not authorized to delete this message' });
      return;
    }

    // Soft delete to maintain the "This message was deleted" UI
    message.isDeleted = true;
    message.content = "This message was deleted";
    message.mediaUrl = undefined; // Scrub any media
    
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message' });
  }
};