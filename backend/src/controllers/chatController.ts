import { Response } from 'express';
import Chat from '../models/Chat';
import { AuthRequest } from '../middleware/authMiddleware';

// Initialize a new chat or fetch an existing 1:1 chat
export const createOrFetchChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { participantId, isGroup, chatName } = req.body;
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Logic for 1:1 Chat
    if (!isGroup) {
      // Check if a 1:1 chat already exists between these two users
      const existingChat = await Chat.findOne({
        type: '1:1',
        participants: { $all: [currentUserId, participantId] }
      }).populate('participants', 'username email status'); // Populate user details, exclude password

      if (existingChat) {
        res.status(200).json(existingChat);
        return;
      }

      // If not, create a new 1:1 chat
      const newChat = new Chat({
        type: '1:1',
        participants: [currentUserId, participantId]
      });
      await newChat.save();
      
      const populatedChat = await newChat.populate('participants', 'username email status');
      res.status(201).json(populatedChat);
      return;
    } 
  } catch (error) {
    res.status(500).json({ message: 'Server error creating or fetching chat', error });
  }
};


export const createGroupChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, participants } = req.body;
    
    // 1. THE FIX: Extract and check creatorId immediately
    const creatorId = req.user?.userId;

    if (!creatorId) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    if (!name || !participants) {
      res.status(400).json({ message: "Group name and participants are required" });
      return;
    }

    let users = typeof participants === 'string' ? JSON.parse(participants) : participants;

    if (users.length < 2) {
      res.status(400).json({ message: "At least 2 other members are required for a group" });
      return;
    }

    // Add creator to users list
    users.push(creatorId);

    // 2. THE FIX: Create the object first
    // We use 'any' or the Interface here to prevent the 'never' inference
    const groupChatData = {
      chatName: name,
      participants: users,
      type: 'group' as const, // 'as const' ensures it matches your enum exactly
      groupAdmins: [creatorId], 
    };

    const groupChat = await Chat.create(groupChatData);

    // 3. THE FIX: Now groupChat._id will be recognized
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("participants", "username avatar status")
      .populate("groupAdmins", "username avatar");

    res.status(201).json(fullGroupChat);
  } catch (error: any) {
    res.status(500).json({ message: "Error creating group", error: error.message });
  }
};

// Add someone to the group
export const addToGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatId, userId } = req.body;

  // 1. Check if the requester is an admin
  const chat = await Chat.findById(chatId);
  if (!chat?.groupAdmins.includes(req.user?.userId as any)) {
    res.status(403).json({ message: "Only admins can add members" });
    return;
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $addToSet: { participants: userId } }, // $addToSet prevents duplicates
    { new: true }
  ).populate("participants", "username avatar status").populate("groupAdmins", "username avatar");

  res.status(200).json(updatedChat);
};

// Remove someone from the group
export const removeFromGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findById(chatId);
  
  // 2. Check if requester is admin OR the user is removing themselves (leaving)
  const isAdmin = chat?.groupAdmins.includes(req.user?.userId as any);
  const isSelf = req.user?.userId === userId;

  if (!isAdmin && !isSelf) {
    res.status(403).json({ message: "Not authorized to remove this member" });
    return;
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { 
      $pull: { 
        participants: userId, 
        groupAdmins: userId // Also remove from admins if they were one
      } 
    },
    { new: true }
  ).populate("participants", "username avatar status").populate("groupAdmins", "username avatar");

  res.status(200).json(updatedChat);
};

export const promoteToAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat?.groupAdmins.includes(req.user?.userId as any)) {
    res.status(403).json({ message: "Only admins can promote others" });
    return;
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $addToSet: { groupAdmins: userId } },
    { new: true }
  ).populate("participants", "username avatar status").populate("groupAdmins", "username avatar");

  res.status(200).json(updatedChat);
};

// Get all chats for the logged-in user
export const getUserChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.userId;

    // 1. ADD THIS CHECK
    if (!currentUserId) {
      res.status(401).json({ message: 'Unauthorized: User ID is missing' });
      return;
    }

    // 2. TypeScript now knows currentUserId is definitely a string!
    const chats = await Chat.find({
      participants: { $in: [currentUserId] }
    })
    .populate('participants', 'username email status')
    .sort({ updatedAt: -1 }); // Most recently active chats first

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching chats', error });
  }
};


