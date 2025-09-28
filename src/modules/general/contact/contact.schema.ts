import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactDocument = Contact & Document;

@Schema({
  timestamps: true,
  collection: 'contacts',
})
export class Contact {
  @Prop({ required: true, trim: true })
  first_name: string;

  @Prop({ required: true, trim: true })
  last_name: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, trim: true })
  message: string;

  //   @Prop({ default: false })
  //   is_read: boolean;

  //   @Prop({ default: false })
  //   is_replied: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);

// Add indexes
ContactSchema.index({ email: 1 });
ContactSchema.index({ createdAt: -1 });
// ContactSchema.index({ is_read: 1 });
