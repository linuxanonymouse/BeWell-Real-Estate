import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import type { LeadDto } from './leads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<LeadDto[]> {
    return this.leadsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<LeadDto | undefined> {
    return this.leadsService.findOne(id);
  }

  @Post()
  async create(@Body() lead: Omit<LeadDto, 'id'>): Promise<LeadDto> {
    return this.leadsService.create(lead);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<LeadDto>): Promise<LeadDto | undefined> {
    return this.leadsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return { deleted: await this.leadsService.delete(id) };
  }
}
