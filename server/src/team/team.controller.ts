import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import type { TeamMember } from './team.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  findAll(): TeamMember[] {
    return this.teamService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): TeamMember | undefined {
    return this.teamService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() member: Omit<TeamMember, 'id'>): TeamMember {
    return this.teamService.create(member);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<TeamMember>): TeamMember | undefined {
    return this.teamService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string): { deleted: boolean } {
    return { deleted: this.teamService.delete(id) };
  }
}
