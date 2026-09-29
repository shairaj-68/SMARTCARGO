import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  customerId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  direction: 'customer_to_company' | 'company_to_customer';
  overallRating: number;
  categories: {
    communication?: number;
    pricing?: number;
    pickup?: number;
    packaging?: number;
    deliveryTime?: number;
    professionalism?: number;
    documentation?: number;
    cargoHandling?: number;
    support?: number;
    promptnessOfPayment?: number;
    documentAccuracy?: number;
    packagingQuality?: number;
    professionalBehaviour?: number;
  };
  comment: string;
  reply: string;
  repliedAt?: Date;
  helpfulCount: number;
  helpfulUsers: mongoose.Types.ObjectId[];
  isReported: boolean;
  reportReason?: string;
}

const reviewSchema = new Schema<IReview>({
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  direction: { type: String, enum: ['customer_to_company', 'company_to_customer'], default: 'customer_to_company' },
  overallRating: { type: Number, required: true, min: 1, max: 5 },
  categories: {
    communication: { type: Number, min: 1, max: 5 },
    pricing: { type: Number, min: 1, max: 5 },
    pickup: { type: Number, min: 1, max: 5 },
    packaging: { type: Number, min: 1, max: 5 },
    deliveryTime: { type: Number, min: 1, max: 5 },
    professionalism: { type: Number, min: 1, max: 5 },
    documentation: { type: Number, min: 1, max: 5 },
    cargoHandling: { type: Number, min: 1, max: 5 },
    support: { type: Number, min: 1, max: 5 },
    promptnessOfPayment: { type: Number, min: 1, max: 5 },
    documentAccuracy: { type: Number, min: 1, max: 5 },
    packagingQuality: { type: Number, min: 1, max: 5 },
    professionalBehaviour: { type: Number, min: 1, max: 5 },
  },
  comment: { type: String, default: '' },
  reply: { type: String, default: '' },
  repliedAt: { type: Date },
  helpfulCount: { type: Number, default: 0 },
  helpfulUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isReported: { type: Boolean, default: false },
  reportReason: { type: String }
}, { timestamps: true });

export default mongoose.model<IReview>('Review', reviewSchema);
