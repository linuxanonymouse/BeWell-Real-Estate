import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import type { Lead } from './leads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Lead[] {
    return this.leadsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string): Lead | undefined {
    return this.leadsService.findOne(id);
  }

  // Allow unauthenticated POST for contact forms/AI chat
  @Post()
  create(@Body() lead: Omit<Lead, 'id' | 'status' | 'createdAt'>): Lead {
    return this.leadsService.create({ ...lead, status: 'New' });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: Lead['status'] }): Lead | undefined {
    return this.leadsService.updateStatus(id, body.status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string): { deleted: boolean } {
    return { deleted: this.leadsService.delete(id) };
  }
}
