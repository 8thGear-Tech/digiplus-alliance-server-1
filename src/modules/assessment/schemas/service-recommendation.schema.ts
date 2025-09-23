// service-recommendation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceRecommendationDocument = ServiceRecommendation & Document;

@Schema({ collection: 'service_recommendations', timestamps: true })
export class ServiceRecommendation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Assessment', required: true })
  assessment_id: Types.ObjectId;

  @Prop({ required: true })
  service_id: string;

  @Prop({ required: true })
  service_name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  min_points: number;

  @Prop({ required: true })
  max_points: number;

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ required: true })
  priority: number;
}

export const ServiceRecommendationSchema = SchemaFactory.createForClass(
  ServiceRecommendation,
);
