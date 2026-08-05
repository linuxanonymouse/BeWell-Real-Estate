import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

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
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
ProjectSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });
