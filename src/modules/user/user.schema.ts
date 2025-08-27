import { Schema, Document, Types } from 'mongoose';
import { UserTypes } from 'src/shared/enums';

export interface User extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: UserTypes;
  first_name: string;
  last_name: string;
  business_name?: string; // Corrected: Made optional in the interface
  profile_picture?: string;
  is_verified: boolean;
  locked_until?: Date | null;
  is_in_recovery: boolean;
  is_verified_for_recovery?: boolean;
  login_attempts?: number;
  phone_number?: string;
  is_active?: boolean;
  created_at: Date;
  updated_at: Date;
}

export const UserSchema: Schema<User> = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserTypes),
    },
    business_name: {
      type: String,
      // Corrected: Removed `required: true` to make it optional
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    profile_picture: {
      type: String,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    locked_until: {
      type: Date,
      default: null,
    },
    is_in_recovery: {
      type: Boolean,
      default: false,
    },
    is_verified_for_recovery: {
      type: Boolean,
      default: false,
    },
    login_attempts: {
      type: Number,
      default: 3,
    },
    phone_number: {
      type: String,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);
