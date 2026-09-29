import mongoose, { Document, Schema } from 'mongoose';

export interface ITracking extends Document {
  bookingId: mongoose.Types.ObjectId;
  status: string;
  location: string;
  notes: string;
  timestamp: Date;
}

const trackingSchema = new Schema<ITracking>({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  status: { type: String, required: true },
  location: { type: String, default: '' },
  notes: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<ITracking>('Tracking', trackingSchema);
