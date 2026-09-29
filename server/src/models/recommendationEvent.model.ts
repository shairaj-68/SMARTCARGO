import mongoose, { Document, Schema } from 'mongoose';

export interface IRecommendationEvent extends Document {
  recommendation_id: string;
  user_id?: string;
  request_intent: Record<string, any>;
  candidate_count: number;
  funnel: {
    searched: number;
    route_match: number;
    date_match: number;
    capacity_match: number;
    cargo_compatible: number;
    recommended: number;
  };
  results: Array<{
    container_id: string;
    match_score: number;
    sub_scores: Record<string, number>;
    rank: number;
  }>;
  model_version: string;
  outcome?: 'shown' | 'viewed' | 'clicked' | 'booked' | 'completed' | 'rated';
  outcome_container_id?: string;
  dataset_version: string;
}

const recommendationEventSchema = new Schema<IRecommendationEvent>({
  recommendation_id: { type: String, required: true, unique: true, index: true },
  user_id: { type: String, index: true },
  request_intent: { type: Schema.Types.Mixed, required: true },
  candidate_count: { type: Number, required: true },
  funnel: {
    searched: Number,
    route_match: Number,
    date_match: Number,
    capacity_match: Number,
    cargo_compatible: Number,
    recommended: Number,
  },
  results: [{
    container_id: String,
    match_score: Number,
    sub_scores: Schema.Types.Mixed,
    rank: Number,
  }],
  model_version: { type: String, default: 'v2-heuristic' },
  outcome: { type: String, enum: ['shown', 'viewed', 'clicked', 'booked', 'completed', 'rated'], default: 'shown' },
  outcome_container_id: { type: String },
  dataset_version: { type: String, default: 'v2-xlsx' },
}, { timestamps: true });

export default mongoose.model<IRecommendationEvent>('RecommendationEvent', recommendationEventSchema, 'recommendation_events');
