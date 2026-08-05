import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeadDocument = Lead & Document;

@Schema({ timestamps: true })
export class Lead {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  message: string;

  @Prop({ default: 'New' })
  status: string;

  @Prop({ default: Date.now })
  createdAt: string;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
LeadSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
LeadSchema.set('toJSON', { virtuals: true });
LeadSchema.set('toObject', { virtuals: true });
