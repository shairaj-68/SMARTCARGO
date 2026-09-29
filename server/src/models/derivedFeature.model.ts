import mongoose, { Document, Schema } from 'mongoose';

export interface IDerivedFeature extends Document {
  feature_type: 'lane' | 'container' | 'provider' | 'customer';
  entity_id: string; // e.g. "INMAA-DEHAM" for lane, container_id, company_id, customer_id
  metrics: Record<string, any>;
  last_computed: Date;
  dataset_version: string;
}

const derivedFeatureSchema = new Schema<IDerivedFeature>({
  feature_type: { type: String, enum: ['lane', 'container', 'provider', 'customer'], required: true, index: true },
  entity_id: { type: String, required: true, index: true },
  metrics: { type: Schema.Types.Mixed, required: true },
  last_computed: { type: Date, default: Date.now },
  dataset_version: { type: String, default: 'v2-xlsx' },
}, { timestamps: true });

derivedFeatureSchema.index({ feature_type: 1, entity_id: 1 }, { unique: true });

export default mongoose.model<IDerivedFeature>('DerivedFeature', derivedFeatureSchema, 'derived_features');
