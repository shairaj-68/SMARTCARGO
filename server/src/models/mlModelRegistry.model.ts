import mongoose, { Document, Schema } from 'mongoose';

export interface IMLModelRegistry extends Document {
  model_name: string;
  version: string;
  training_date: Date;
  dataset_version: string;
  features_used: string[];
  metrics: Record<string, number>; // e.g. MAE, RMSE, AUC, Precision@5
  status: 'active' | 'archived' | 'experimental';
}

const mlModelRegistrySchema = new Schema<IMLModelRegistry>({
  model_name: { type: String, required: true },
  version: { type: String, required: true },
  training_date: { type: Date, default: Date.now },
  dataset_version: { type: String, default: 'v2-xlsx' },
  features_used: [{ type: String }],
  metrics: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['active', 'archived', 'experimental'], default: 'active' },
}, { timestamps: true });

export default mongoose.model<IMLModelRegistry>('MLModelRegistry', mlModelRegistrySchema, 'ml_model_registry');
