import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema({ timestamps: true })
export class TicketMessage {
  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  senderName: string;

  @Prop({ required: true })
  senderRole: string; // 'client' | 'superadmin' | 'support'

  @Prop({ default: '' })
  text: string;

  @Prop()
  attachmentUrl?: string;

  @Prop()
  attachmentType?: string; // 'image' | 'video'

  @Prop({ default: Date.now })
  date: Date;
}

export const TicketMessageSchema = SchemaFactory.createForClass(TicketMessage);

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ required: true })
  clientId: string;

  @Prop({ required: true })
  clientName: string;

  @Prop({ required: true })
  department: string; // 'management' | 'support'

  @Prop({ default: 'open' })
  status: string; // 'open' | 'closed'

  @Prop({ type: [TicketMessageSchema], default: [] })
  messages: TicketMessage[];

  @Prop({ default: false })
  hasUnreadForAdmin: boolean;

  @Prop({ default: false })
  hasUnreadForClient: boolean;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
TicketSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
TicketSchema.set('toJSON', { virtuals: true });
TicketSchema.set('toObject', { virtuals: true });
