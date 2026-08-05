import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import type { ProjectDto } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(): Promise<ProjectDto[]> {
    return this.projectsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProjectDto | undefined> {
    return this.projectsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() project: Omit<ProjectDto, 'id'>): Promise<ProjectDto> {
    return this.projectsService.create(project);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<ProjectDto>): Promise<ProjectDto | undefined> {
    return this.projectsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return { deleted: await this.projectsService.delete(id) };
  }
}
