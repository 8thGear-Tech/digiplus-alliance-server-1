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
  image: string; // still keep a primary image

  @Prop({ type: [String], default: [] })
  images: string[]; // multiple pictures

  //changed by opeyemi
  @Prop({ required: true, type: Number, min: 0 })
  price: number;

  @Prop({ type: Number, min: 0 })
  discounted_price?: number;

  // In your Service schema
  @Prop({
    type: String,
    enum: [
      'per_hour',
      'per_project',
      'one_time_payment',
      'per_day',
      'per_month',
      'per_quarter'
    ],
    default: 'one_time_payment',
  })
  pricing_unit?: string;
  //changed by opeyemi
  // @Prop({ required: true, trim: true, maxlength: 500 })
  // subtitle: string;

  @Prop({ trim: true, maxlength: 500 })
  short_description?: string;

  @Prop({ trim: true })
  long_description?: string;

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
//changed by opeyemi
ServiceSchema.index({ name: 'text', description: 'text' });

// ServiceSchema.index({ name: 'text', subtitle: 'text', description: 'text' });
