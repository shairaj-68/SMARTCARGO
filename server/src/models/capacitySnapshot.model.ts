import mongoose, { Document, Schema } from 'mongoose';

export interface ICapacitySnapshot extends Document {
  availability_id: string;
  container_id: string;
  snapshot_date: Date;
  available_cbm: number;
  available_weight_kg: number;
  total_cbm: number;
  total_weight_kg: number;
  dataset_version: string;
}

const capacitySnapshotSchema = new Schema<ICapacitySnapshot>({
  availability_id: { type: String, required: true, index: true },
  container_id: { type: String, required: true, index: true },
  snapshot_date: { type: Date, required: true, index: true },
  available_cbm: { type: Number, required: true },
  available_weight_kg: { type: Number, required: true },
  total_cbm: { type: Number, required: true },
  total_weight_kg: { type: Number, required: true },
  dataset_version: { type: String, default: 'v2-xlsx' },
}, { timestamps: true });

capacitySnapshotSchema.index({ container_id: 1, snapshot_date: 1 });

export default mongoose.model<ICapacitySnapshot>('CapacitySnapshot', capacitySnapshotSchema, 'capacity_snapshots');
