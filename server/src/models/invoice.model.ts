import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  bookingId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  items: IInvoiceItem[];
  subtotal: number;
  gst: number;
  commission: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  dueDate: Date;
  paidDate: Date;
}

const invoiceSchema = new Schema<IInvoice>({
  invoiceNumber: { type: String, unique: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  items: [{
    description: String,
    quantity: Number,
    rate: Number,
    amount: Number,
  }],
  subtotal: { type: Number, required: true },
  gst: { type: Number, default: 0 },
  commission: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'sent', 'paid', 'cancelled'], default: 'draft' },
  dueDate: { type: Date },
  paidDate: { type: Date },
}, { timestamps: true });

invoiceSchema.pre('save', function(next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = 'INV' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

export default mongoose.model<IInvoice>('Invoice', invoiceSchema);
