import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { TeamService } from './team.service';
import type { TeamMember } from './team.service';

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

  @Post()
  create(@Body() member: Omit<TeamMember, 'id'>): TeamMember {
    return this.teamService.create(member);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<TeamMember>): TeamMember | undefined {
    return this.teamService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): { deleted: boolean } {
    return { deleted: this.teamService.delete(id) };
  }
}
