import { Schema, model, Document, Types } from 'mongoose';
import { DatabaseModelNames } from 'src/shared/enums';

export interface BusinessProfile extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  business_name: string;
  industry?: string;
  email: string;
  phone_number?: string;
  company_website?: string;
  company_address: string;
  city: string;
  state: string;
  country: string;
  logo_url?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export const BusinessProfileSchema = new Schema<BusinessProfile>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: DatabaseModelNames.USER,
      required: true,
    },
    business_name: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
    },
    company_website: {
      type: String,
    },
    company_address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    logo_url: {
      type: String,
    },
  },
  { timestamps: true },
);
