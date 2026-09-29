import mongoose, { Document, Schema } from 'mongoose';

export interface IContainer extends Document {
  companyId: mongoose.Types.ObjectId;
  containerNumber: string;
  type: '20ft' | '40ft' | 'reefer' | 'openTop' | 'flatRack';
  originPort: string;
  destinationPort: string;
  originCountry: string;
  destinationCountry: string;
  departureDate: Date;
  arrivalDate: Date;
  capacity: number;
  bookedSpace: number;
  availableSpace: number;
  pricePerCBM: number;
  minBooking: number;
  maxBooking: number;
  cargoTypes: string[];
  status: 'active' | 'paused' | 'closed' | 'full';
  terms: string;
  images: string[];
  dataset_version?: string;
  origin_port_id?: string;
  destination_port_id?: string;
  max_weight_kg?: number;
  available_weight_kg?: number;
  preferred_cargo_type?: string;
}

const containerSchema = new Schema<IContainer>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  containerNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['20ft', '40ft', 'reefer', 'openTop', 'flatRack'], required: true },
  originPort: { type: String, required: true },
  destinationPort: { type: String, required: true },
  originCountry: { type: String, required: true },
  destinationCountry: { type: String, required: true },
  departureDate: { type: Date, required: true },
  arrivalDate: { type: Date, required: true },
  capacity: { type: Number, required: true },
  bookedSpace: { type: Number, default: 0 },
  availableSpace: { type: Number, required: true },
  pricePerCBM: { type: Number, required: true },
  minBooking: { type: Number, default: 1 },
  maxBooking: { type: Number, required: true },
  cargoTypes: [{ type: String }],
  status: { type: String, enum: ['active', 'paused', 'closed', 'full'], default: 'active' },
  terms: { type: String, default: '' },
  images: [{ type: String }],
  dataset_version: { type: String, default: 'v1' },
  origin_port_id: { type: String, default: '' },
  destination_port_id: { type: String, default: '' },
  max_weight_kg: { type: Number, default: 30000 },
  available_weight_kg: { type: Number, default: 30000 },
  preferred_cargo_type: { type: String, default: '' },
}, { timestamps: true });

// Search performance indexes — prevents full collection scan on every search
containerSchema.index({ status: 1, availableSpace: 1, departureDate: 1 });
containerSchema.index({ originPort: 1 });
containerSchema.index({ destinationPort: 1 });
containerSchema.index({ origin_port_id: 1, destination_port_id: 1 });

export default mongoose.model<IContainer>('Container', containerSchema);
