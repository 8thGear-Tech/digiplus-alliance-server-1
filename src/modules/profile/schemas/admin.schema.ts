import { Schema, Document, Types } from 'mongoose';
import { DatabaseModelNames } from 'src/shared/enums';

export interface AdminProfile extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  email: string;
  role?: string;
  phone_number?: string;
  website?: string;
  created_at: Date;
  updated_at: Date;
}

export const AdminProfileSchema = new Schema<AdminProfile>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: DatabaseModelNames.USER,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
    },
    phone_number: {
      type: String,
    },
    website: {
      type: String,
    },
  },
  { timestamps: true },
);
