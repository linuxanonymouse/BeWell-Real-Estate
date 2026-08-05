import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import type { TeamMemberDto } from './team.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  async findAll(): Promise<TeamMemberDto[]> {
    return this.teamService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TeamMemberDto | undefined> {
    return this.teamService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() member: Omit<TeamMemberDto, 'id'>): Promise<TeamMemberDto> {
    return this.teamService.create(member);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<TeamMemberDto>): Promise<TeamMemberDto | undefined> {
    return this.teamService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return { deleted: await this.teamService.delete(id) };
  }
}
