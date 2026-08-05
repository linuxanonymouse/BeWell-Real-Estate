import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TelegramSettingsDocument = TelegramSettings & Document;

@Schema()
export class TelegramSettings {
  @Prop({ default: '' })
  token: string;

  @Prop({ default: '' })
  chatId: string;
}

export const TelegramSettingsSchema = SchemaFactory.createForClass(TelegramSettings);
TelegramSettingsSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
TelegramSettingsSchema.set('toJSON', { virtuals: true });
TelegramSettingsSchema.set('toObject', { virtuals: true });
