import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  type: 'commercial_invoice' | 'packing_list' | 'bill_of_lading' | 'shipping_invoice' | 'insurance_certificate' | 'gst_invoice' | 'export_declaration' | 'customs_documents' | 'delivery_receipt' | 'other';
  fileName: string;
  fileUrl: string;
  status: 'pending_upload' | 'uploaded' | 'under_review' | 'verified' | 'rejected' | 'expired' | 'archived';
  verifiedBy?: mongoose.Types.ObjectId;
  expiryDate?: Date;
  uploadedByRole: 'customer' | 'carrier' | 'admin';
  version: number;
  history: {
    fileUrl: string;
    fileName: string;
    version: number;
    uploadedAt: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const documentSchema = new Schema<IDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
  type: { 
    type: String, 
    enum: ['commercial_invoice', 'packing_list', 'bill_of_lading', 'shipping_invoice', 'insurance_certificate', 'gst_invoice', 'export_declaration', 'customs_documents', 'delivery_receipt', 'other'], 
    required: true 
  },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending_upload', 'uploaded', 'under_review', 'verified', 'rejected', 'expired', 'archived'], 
    default: 'uploaded' 
  },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  expiryDate: { type: Date },
  uploadedByRole: { type: String, enum: ['customer', 'carrier', 'admin'], default: 'customer' },
  version: { type: Number, default: 1 },
  history: [{
    fileUrl: { type: String },
    fileName: { type: String },
    version: { type: Number },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model<IDocument>('Document', documentSchema);
