import { Controller, Get, Param } from '@nestjs/common';
import { ProjectsService, Project } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(): Project[] {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Project {
    return this.projectsService.findOne(id);
  }
}
