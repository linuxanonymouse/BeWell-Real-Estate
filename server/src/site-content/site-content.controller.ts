import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SiteContentService, SiteContent } from './site-content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('site-content')
export class SiteContentController {
  constructor(private readonly siteContentService: SiteContentService) {}

  @Get()
  getContent(): SiteContent {
    return this.siteContentService.getContent();
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  updateContent(@Body() data: SiteContent): SiteContent {
    return this.siteContentService.updateContent(data);
  }
}
