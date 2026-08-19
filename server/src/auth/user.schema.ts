import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'client' })
  role: string; // 'superadmin' | 'support' | 'client'

  @Prop()
  phone: string;

  @Prop({ type: [String], default: [] })
  assignedProjectIds: string[];

  @Prop({ type: [String], default: [] })
  telegramChatIds: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });
