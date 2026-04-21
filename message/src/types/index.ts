export type MessageStatus = 'sent' | 'delivered' | 'read';

export type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export interface User {
  _id: string;
  username: string;
  avatar?: string;
  status: UserStatus;
  lastSeen?: string;
}

export interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  status: MessageStatus;
  isMe: boolean;
  reactions?: { emoji: string; count: number }[];
}

export interface Conversation {
  _id: string;
  type: '1:1' | 'group';
  participants: User[]; // The populated array of users
  chatName?: string; // Only exists on group chats
  groupAdmins?: User[]; // Only exists on group chats
  
  // These might come from your latestMessage population or Redux state
  latestMessage?: any; // Optional: Change 'any' to your actual Message interface
  unreadCount?: number; 
  
  createdAt?: string;
  updatedAt?: string;
}

export interface ActiveChat {
  conversation: Conversation;
  messages: Message[];
}
