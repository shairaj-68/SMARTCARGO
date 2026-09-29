import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  registrationNumber: string;
  gstNumber: string;
  address: string;
  city: string;
  country: string;
  documents: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rating: number;
  totalReviews: number;
  totalBookings: number;
  description: string;
  website: string;
}

const companySchema = new Schema<ICompany>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true, trim: true },
  registrationNumber: { type: String, required: true, unique: true },
  gstNumber: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  documents: [{ type: String }],
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  description: { type: String, default: '' },
  website: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<ICompany>('Company', companySchema);
