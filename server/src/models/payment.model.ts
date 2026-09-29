import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  bookingId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  amount: number;
  commission: number;
  gst: number;
  totalAmount: number;
  method: 'razorpay' | 'stripe' | 'upi' | 'card' | 'net_banking' | 'wallet';
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  refundAmount: number;
  refundReason: string;
}

const paymentSchema = new Schema<IPayment>({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  amount: { type: Number, required: true },
  commission: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  method: { type: String, enum: ['razorpay', 'stripe', 'upi', 'card', 'net_banking', 'wallet'], required: true },
  transactionId: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  refundAmount: { type: Number, default: 0 },
  refundReason: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<IPayment>('Payment', paymentSchema);
