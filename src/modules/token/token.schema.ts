import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Identifier } from '../../shared/types/schema.type';
import { TokenTypes, UserTypes } from '../../shared/enums';

@Schema({
  timestamps: true,
})
export class Token {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: () => new Types.ObjectId(),
  })
  _id?: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
  })
  value: string;

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
    enum: Object.values(UserTypes),
  })
  userType: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
  })
  userId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
    enum: Object.values(TokenTypes),
  })
  type: string;

  @Prop()
  expiresIn?: Date;
}

export type TokenIdentifier = Identifier | Token;

export type TokenDocument = HydratedDocument<Token>;
export const TokenSchema = SchemaFactory.createForClass(Token);
