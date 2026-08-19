import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import type { ProjectDto } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAllPublic(): Promise<ProjectDto[]> {
    return this.projectsService.findAll(); // Defaults to unauthenticated
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async findAllForDashboard(@Request() req: any): Promise<ProjectDto[]> {
    return this.projectsService.findAll(req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProjectDto | undefined> {
    return this.projectsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() project: Omit<ProjectDto, 'id'>): Promise<ProjectDto> {
    return this.projectsService.create(project, req.user);
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

  // --- Material endpoints ---

  @UseGuards(JwtAuthGuard)
  @Post(':id/materials')
  async addMaterial(
    @Param('id') id: string,
    @Body() material: { name: string; unit: string; quantity: number; initialPrice: number; currentPrice: number },
  ): Promise<ProjectDto | undefined> {
    return this.projectsService.addMaterial(id, material);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/materials/:materialId/price')
  async updateMaterialPrice(
    @Param('id') id: string,
    @Param('materialId') materialId: string,
    @Body() body: { price: number },
  ): Promise<ProjectDto | undefined> {
    return this.projectsService.updateMaterialPrice(id, materialId, body.price);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/materials/:materialId')
  async deleteMaterial(
    @Param('id') id: string,
    @Param('materialId') materialId: string,
  ): Promise<ProjectDto | undefined> {
    return this.projectsService.deleteMaterial(id, materialId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/progress')
  async addProgressUpdate(
    @Param('id') id: string,
    @Body() body: { text: string; images: string[] },
  ): Promise<ProjectDto | undefined> {
    return this.projectsService.addProgressUpdate(id, body);
  }
}
