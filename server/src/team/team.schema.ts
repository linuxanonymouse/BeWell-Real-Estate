import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamMemberDocument = TeamMember & Document;

@Schema()
export class TeamMember {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  role: string;

  @Prop()
  image: string;

  @Prop()
  bio: string;
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);
TeamMemberSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
TeamMemberSchema.set('toJSON', { virtuals: true });
TeamMemberSchema.set('toObject', { virtuals: true });
