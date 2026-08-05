import { Module } from '@nestjs/common';
import { SiteContentService } from './site-content.service';
import { SiteContentController } from './site-content.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SiteContent, SiteContentSchema } from './site-content.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SiteContent.name, schema: SiteContentSchema }]),
  ],
  controllers: [SiteContentController],
  providers: [SiteContentService],
  exports: [SiteContentService],
})
export class SiteContentModule {}
