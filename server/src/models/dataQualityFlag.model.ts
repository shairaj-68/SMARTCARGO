import mongoose, { Document, Schema } from 'mongoose';

export interface IDataQualityFlag extends Document {
  sheet_name: string;
  row_index: number;
  entity_id: string;
  reason_code: 'DUPLICATE_CONTAINER' | 'LANE_MISMATCH' | 'CAPACITY_OVERFLOW' | 'PRICE_OUTLIER' | 'SPARSE_DATA' | 'INVALID_ENUM';
  details: string;
  raw_data: Record<string, any>;
  dataset_version: string;
}

const dataQualityFlagSchema = new Schema<IDataQualityFlag>({
  sheet_name: { type: String, required: true },
  row_index: { type: Number, required: true },
  entity_id: { type: String, required: true },
  reason_code: {
    type: String,
    enum: ['DUPLICATE_CONTAINER', 'LANE_MISMATCH', 'CAPACITY_OVERFLOW', 'PRICE_OUTLIER', 'SPARSE_DATA', 'INVALID_ENUM'],
    required: true,
  },
  details: { type: String, required: true },
  raw_data: { type: Schema.Types.Mixed },
  dataset_version: { type: String, default: 'v2-xlsx' },
}, { timestamps: true });

export default mongoose.model<IDataQualityFlag>('DataQualityFlag', dataQualityFlagSchema, 'data_quality_flags');
