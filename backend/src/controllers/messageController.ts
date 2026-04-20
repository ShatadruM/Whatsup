import { Response } from 'express';
import Message, { MediaType } from '../models/Message'; // Added MediaType here
import Chat from '../models/Chat';
import { AuthRequest } from '../middleware/authMiddleware';
import { v2 as cloudinary } from 'cloudinary'; // Added Cloudinary import
import dotenv from 'dotenv';

dotenv.config();
// 1. Configure Cloudinary right at the top
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

// --- THE NEW MEDIA FUNCTION ---
export const sendMessageWithMedia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, chatId } = req.body;
    const currentUserId = req.user?.userId; 

    if (!chatId) {
      res.status(400).json({ message: 'Invalid data passed into request' });
      return;
    }

    let mediaUrl = undefined;
    let mediaType: MediaType = null;
    let mediaName = undefined;

    // If a file exists, upload to Cloudinary
    if (req.file) {
      // Convert memory buffer to Base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      
      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: 'chat_media',
        resource_type: 'auto' 
      });
      
      mediaUrl = uploadResponse.secure_url;
      mediaName = req.file.originalname; 

      if (uploadResponse.resource_type === 'image') {
        mediaType = 'image';
      } else if (uploadResponse.resource_type === 'video') {
        mediaType = req.file.mimetype.startsWith('audio') ? 'audio' : 'video';
      } else if (uploadResponse.resource_type === 'raw') {
        mediaType = 'document'; 
      }
    }

    let newMessage = await Message.create({
      senderId: currentUserId,
      chatId: chatId,
      content: content || '', 
      mediaUrl,
      mediaType,
      mediaName
    });

    newMessage = await newMessage.populate('senderId', 'username avatar status');
    newMessage = await newMessage.populate('chatId');

    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Media upload error:", error);
    res.status(500).json({ message: 'Server error sending media' });
  }
};