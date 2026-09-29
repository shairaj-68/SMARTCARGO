import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  messageId: string;
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  message: string;
  messageType: 'text' | 'image' | 'pdf' | 'excel' | 'word' | 'zip';
  timestamp: Date;
  status: 'Sending' | 'Delivered' | 'Seen' | 'Failed';
  isRead: boolean;
  attachments: string[];
}

const messageSchema = new Schema<IMessage>({
  messageId: { type: String, required: true, unique: true },
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },
  messageType: { type: String, enum: ['text', 'image', 'pdf', 'excel', 'word', 'zip'], default: 'text' },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['Sending', 'Delivered', 'Seen', 'Failed'], default: 'Sending' },
  isRead: { type: Boolean, default: false },
  attachments: [{ type: String }],
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', messageSchema);
