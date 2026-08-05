import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SiteContentDocument = SiteContent & Document;

@Schema()
export class SiteContent {
  @Prop({ type: Object, default: {} })
  hero: any;

  @Prop({ type: Object, default: {} })
  projectsSection: any;

  @Prop({ type: Object, default: {} })
  certifications: any;

  @Prop({ type: Object, default: {} })
  footer: any;
}

export const SiteContentSchema = SchemaFactory.createForClass(SiteContent);
SiteContentSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
SiteContentSchema.set('toJSON', { virtuals: true });
SiteContentSchema.set('toObject', { virtuals: true });
