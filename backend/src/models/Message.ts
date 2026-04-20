import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  mediaUrl?: string;
  status: 'sent' | 'delivered' | 'read';
  isDeleted: boolean; // Added for moderation/WhatsApp style deletion
  timestamp: Date;
}

const MessageSchema: Schema = new Schema({
  chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  mediaUrl: { type: String, required: false },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  isDeleted: { type: Boolean, default: false }
}, { 
  timestamps: { createdAt: 'timestamp', updatedAt: false } 
});

export default mongoose.model<IMessage>('Message', MessageSchema);