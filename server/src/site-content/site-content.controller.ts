import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { SiteContentService } from './site-content.service';
import type { SiteContentDto } from './site-content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('site-content')
export class SiteContentController {
  constructor(private readonly siteContentService: SiteContentService) {}

  @Get()
  async getContent(): Promise<SiteContentDto> {
    return this.siteContentService.getContent();
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateContent(@Body() data: SiteContentDto): Promise<SiteContentDto> {
    return this.siteContentService.updateContent(data);
  }
}
