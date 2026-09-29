import mongoose, { Document, Schema } from 'mongoose';

export interface IPriceHistory extends Document {
  price_id: string;
  origin_port_id: string;
  destination_port_id: string;
  origin_port_name: string;
  destination_port_name: string;
  cargo_type: string;
  container_type: string;
  base_price_per_cbm: number;
  quoted_price_per_cbm: number;
  scaled_price_per_cbm: number;
  currency: string;
  valid_from: Date;
  valid_to: Date;
  logistics_company_id: string;
  dataset_version: string;
}

const priceHistorySchema = new Schema<IPriceHistory>({
  price_id: { type: String, required: true, index: true },
  origin_port_id: { type: String, required: true, index: true },
  destination_port_id: { type: String, required: true, index: true },
  origin_port_name: { type: String },
  destination_port_name: { type: String },
  cargo_type: { type: String, required: true },
  container_type: { type: String },
  base_price_per_cbm: { type: Number, required: true },
  quoted_price_per_cbm: { type: Number, required: true },
  scaled_price_per_cbm: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  valid_from: { type: Date, required: true, index: true },
  valid_to: { type: Date, required: true },
  logistics_company_id: { type: String, required: true },
  dataset_version: { type: String, default: 'v2-xlsx' },
}, { timestamps: true });

priceHistorySchema.index({ origin_port_id: 1, destination_port_id: 1, cargo_type: 1, valid_from: 1 });

export default mongoose.model<IPriceHistory>('PriceHistory', priceHistorySchema, 'price_history');
