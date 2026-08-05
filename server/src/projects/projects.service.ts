import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './projects.schema';
import * as fs from 'fs';
import * as path from 'path';

export interface ProjectDto {
  id?: string;
  name: string;
  location: string;
  status: string;
  value: string;
  image?: string;
}

@Injectable()
export class ProjectsService implements OnModuleInit {
  private readonly logger = new Logger(ProjectsService.name);
  private readonly dataPath = path.join(__dirname, '..', '..', 'data', 'projects.json');

  constructor(@InjectModel(Project.name) private projectModel: Model<ProjectDocument>) {}

  async onModuleInit() {
    const count = await this.projectModel.countDocuments().exec();
    if (count === 0) {
      try {
        if (fs.existsSync(this.dataPath)) {
          const raw = fs.readFileSync(this.dataPath, 'utf-8');
          const data = JSON.parse(raw);
          if (Array.isArray(data) && data.length > 0) {
            await this.projectModel.insertMany(data.map(({ id, ...rest }) => rest));
            this.logger.log('Seeded projects from disk');
          }
        }
      } catch (err) {
        this.logger.error('Failed to seed projects from disk', err);
      }
    }
    // Migrate: strip hardcoded localhost URLs from image fields
    await this.projectModel.updateMany(
      { image: { $regex: '^http://localhost' } },
      [{ $set: { image: { $replaceAll: { input: '$image', find: 'http://localhost:3001', replacement: '' } } } }],
    );
  }

  async findAll(): Promise<ProjectDto[]> {
    const projects = await this.projectModel.find().exec();
    return projects.map(p => this.mapToDto(p));
  }

  async findOne(id: string): Promise<ProjectDto | undefined> {
    const p = await this.projectModel.findById(id).exec();
    return p ? this.mapToDto(p) : undefined;
  }

  async create(project: Omit<ProjectDto, 'id'>): Promise<ProjectDto> {
    const newProject = new this.projectModel(project);
    const p = await newProject.save();
    return this.mapToDto(p);
  }

  async update(id: string, data: Partial<ProjectDto>): Promise<ProjectDto | undefined> {
    const p = await this.projectModel.findByIdAndUpdate(id, data, { new: true }).exec();
    return p ? this.mapToDto(p) : undefined;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.projectModel.findByIdAndDelete(id).exec();
    return res !== null;
  }

  private mapToDto(doc: any): ProjectDto {
    return {
      id: doc._id.toString(),
      name: doc.name,
      location: doc.location,
      status: doc.status,
      value: doc.value,
      image: doc.image
    };
  }
}
