import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ _id: false })
export class PriceHistoryEntry {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  price: number;
}

export const PriceHistoryEntrySchema = SchemaFactory.createForClass(PriceHistoryEntry);

@Schema({ _id: true })
export class Material {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  initialPrice: number;

  @Prop({ required: true })
  currentPrice: number;

  @Prop({ type: [PriceHistoryEntrySchema], default: [] })
  priceHistory: PriceHistoryEntry[];
}

export const MaterialSchema = SchemaFactory.createForClass(Material);

@Schema()
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  value: string;

  @Prop()
  image: string;

  @Prop({ type: [MaterialSchema], default: [] })
  materials: Material[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
ProjectSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });
