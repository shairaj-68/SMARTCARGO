import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  conversationId: string;
  bookingId: mongoose.Types.ObjectId;
  exporterId: mongoose.Types.ObjectId;
  carrierId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  conversationId: { type: String, required: true, unique: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  exporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  carrierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
}, { timestamps: true });

export default mongoose.model<IConversation>('Conversation', conversationSchema);
