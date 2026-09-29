import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus = 'pending' | 'counter_offer' | 'accepted' | 'payment_pending' | 'confirmed' | 'pickup_scheduled' | 'cargo_received' | 'container_loaded' | 'in_transit' | 'reached_port' | 'customs_clearance' | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled';

export interface IQuotation {
  pricePerCBM: number;
  totalAmount: number;
  pickupDate: Date;
  availableSpace: number;
  conditions: string;
}

export interface IBooking extends Document {
  customerId: mongoose.Types.ObjectId;
  containerId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  requiredCBM: number;
  cargoWeight: number;
  cargoType: string;
  pickupAddress: string;
  deliveryAddress: string;
  specialInstructions: string;
  documents: string[];
  status: BookingStatus;
  quotation: IQuotation;
  paymentId: mongoose.Types.ObjectId;
  bookingNumber: string;
  dataset_version?: string;
  dataset_booking_id?: string;
  origin_port_id?: string;
  destination_port_id?: string;
  capacity_anomaly?: boolean;
  service_type?: string;
  priority?: string;
}

const bookingSchema = new Schema<IBooking>({
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  containerId: { type: Schema.Types.ObjectId, ref: 'Container', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  requiredCBM: { type: Number, required: true },
  cargoWeight: { type: Number, required: true },
  cargoType: { type: String, required: true },
  pickupAddress: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  specialInstructions: { type: String, default: '' },
  documents: [{ type: String }],
  status: { type: String, enum: ['pending', 'counter_offer', 'accepted', 'payment_pending', 'confirmed', 'pickup_scheduled', 'cargo_received', 'container_loaded', 'in_transit', 'reached_port', 'customs_clearance', 'out_for_delivery', 'delivered', 'completed', 'cancelled'], default: 'pending' },
  quotation: {
    pricePerCBM: Number,
    totalAmount: Number,
    pickupDate: Date,
    availableSpace: Number,
    conditions: String,
  },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
  bookingNumber: { type: String },
  dataset_version: { type: String, default: 'v1' },
  dataset_booking_id: { type: String, default: '' },
  origin_port_id: { type: String, default: '' },
  destination_port_id: { type: String, default: '' },
  capacity_anomaly: { type: Boolean, default: false },
  service_type: { type: String, default: 'Port-to-Port' },
  priority: { type: String, default: 'Standard' },
}, { timestamps: true });

bookingSchema.pre('save', function(next) {
  if (!this.bookingNumber) {
    this.bookingNumber = 'BK' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

export default mongoose.model<IBooking>('Booking', bookingSchema);
