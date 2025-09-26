import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ServicesTypes } from 'src/shared/enums';

export type ServiceDocument = Service & Document & { _id: Types.ObjectId };

@Schema({
  timestamps: true,
  collection: 'services',
})
export class Service {
  @Prop({ required: true, trim: true, maxlength: 255 })
  name: string;

  @Prop({ type: String, enum: Object.values(ServicesTypes), required: true })
  service_type: ServicesTypes;

  @Prop({ required: true, trim: true })
  image: string;

  @Prop({ required: true, type: Number, min: 0 })
  price: number;

  @Prop({ required: true, trim: true, maxlength: 500 })
  subtitle: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ default: null })
  deletedAt?: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

// Add indexes for better performance
ServiceSchema.index({ name: 1 });
ServiceSchema.index({ deletedAt: 1 });
ServiceSchema.index({ name: 'text', subtitle: 'text', description: 'text' });
