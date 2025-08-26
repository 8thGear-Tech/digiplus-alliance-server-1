import { Document, Schema, Types } from 'mongoose';
import { DatabaseModelNames } from 'src/shared/enums';

export interface RefreshToken extends Document {
  token: string;
  user: Types.ObjectId;
  expiresAt: Date;
}

export const RefreshTokenSchema = new Schema<RefreshToken>(
  {
    token: { type: String, required: true, unique: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: DatabaseModelNames.USER,
      required: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);
