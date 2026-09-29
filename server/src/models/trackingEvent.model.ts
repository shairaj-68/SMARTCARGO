import mongoose, { Document, Schema } from 'mongoose';

export interface ITrackingEvent extends Document {
  tracking_event_id: string;
  booking_id: string;
  container_id: string;
  event_type: string;
  event_time: Date;
  location: string;
  latitude: number;
  longitude: number;
  status_details: string;
  dataset_version: string;
}

const trackingEventSchema = new Schema<ITrackingEvent>({
  tracking_event_id: { type: String, required: true, index: true },
  booking_id: { type: String, required: true, index: true },
  container_id: { type: String, required: true, index: true },
  event_type: { type: String, required: true },
  event_time: { type: Date, required: true, index: true },
  location: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  status_details: { type: String },
  dataset_version: { type: String, default: 'v2-xlsx' },
}, { timestamps: true });

trackingEventSchema.index({ booking_id: 1, event_time: 1 });

export default mongoose.model<ITrackingEvent>('TrackingEvent', trackingEventSchema, 'tracking_events');
