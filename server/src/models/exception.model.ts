import mongoose, { Document, Schema } from 'mongoose';

export interface IException extends Document {
  exception_id: string;
  type: 'payment_pending' | 'delay_risk' | 'low_utilization' | 'doc_mismatch' | 'unanswered_message' | 'capacity_anomaly' | 'price_outlier';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  target_type: 'booking' | 'container' | 'document' | 'payment';
  target_id: string;
  title: string;
  details: string;
  metadata: Record<string, any>;
  status: 'open' | 'acknowledged' | 'resolved';
  dataset_version: string;
}

const exceptionSchema = new Schema<IException>({
  exception_id: { type: String, required: true, unique: true, index: true },
  type: {
    type: String,
    enum: ['payment_pending', 'delay_risk', 'low_utilization', 'doc_mismatch', 'unanswered_message', 'capacity_anomaly', 'price_outlier'],
    required: true,
  },
  severity: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], required: true },
  target_type: { type: String, enum: ['booking', 'container', 'document', 'payment'], required: true },
  target_id: { type: String, required: true, index: true },
  title: { type: String, required: true },
  details: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  status: { type: String, enum: ['open', 'acknowledged', 'resolved'], default: 'open' },
  dataset_version: { type: String, default: 'v2-xlsx' },
}, { timestamps: true });

export default mongoose.model<IException>('Exception', exceptionSchema, 'exceptions');
