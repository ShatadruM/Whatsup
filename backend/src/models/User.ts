import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string; // Optional if using third-party auth later
  status: 'online' | 'offline';
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['online', 'offline'], default: 'offline' }
}, { 
  timestamps: true 
});

export default mongoose.model<IUser>('User', UserSchema);