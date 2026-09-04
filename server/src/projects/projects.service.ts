import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './projects.schema';
import * as fs from 'fs';
import * as path from 'path';
import { TelegramService } from '../telegram/telegram.service';

export interface MaterialDto {
  id?: string;
  name: string;
  unit: string;
  quantity: number;
  initialPrice: number;
  currentPrice: number;
  priceHistory: { date: string; price: number }[];
}

export interface ProjectDto {
  id?: string;
  name: string;
  location: string;
  status: string;
  value: string;
  image?: string;
  materials?: MaterialDto[];
  progressUpdates?: { text: string; images: string[]; date: string }[];
  ownerId?: string;
  approvalStatus?: string;
  isPublic?: boolean;
}

@Injectable()
export class ProjectsService implements OnModuleInit {
  private readonly logger = new Logger(ProjectsService.name);
  private readonly dataPath = path.join(__dirname, '..', '..', 'data', 'projects.json');

  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @Inject(forwardRef(() => TelegramService)) private telegramService: TelegramService
  ) {}

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
  }

  async findAll(user?: any): Promise<ProjectDto[]> {
    let query: any = { isPublic: true }; // Default for unauthenticated

    if (user) {
      if (user.role === 'superadmin' || user.role === 'support') {
        query = {}; // Admins see everything
      } else if (user.role === 'client') {
        query = { $or: [{ isPublic: true }, { ownerId: user.userId }] };
      }
    }

    const projects = await this.projectModel.find(query).exec();
    return projects.map(p => this.mapToDto(p));
  }

  async findOne(id: string): Promise<ProjectDto | undefined> {
    const p = await this.projectModel.findById(id).exec();
    return p ? this.mapToDto(p) : undefined;
  }

  async create(project: Omit<ProjectDto, 'id'>, user?: any): Promise<ProjectDto> {
    const payload = { ...project };
    if (user && user.role === 'client') {
      payload.ownerId = user.userId;
      payload.approvalStatus = 'pending';
      payload.status = 'planning'; // Provide default status
      payload.isPublic = false;
    }
    const newProject = new this.projectModel(payload);
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

  // --- Material management ---

  async addMaterial(projectId: string, material: Omit<MaterialDto, 'id' | 'priceHistory'>): Promise<ProjectDto | undefined> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) return undefined;

    project.materials.push({
      name: material.name,
      unit: material.unit,
      quantity: material.quantity,
      initialPrice: material.initialPrice,
      currentPrice: material.currentPrice,
      priceHistory: [{ date: new Date(), price: material.currentPrice }],
    } as any);

    await project.save();
    return this.mapToDto(project);
  }

  async updateMaterialPrice(projectId: string, materialId: string, newPrice: number): Promise<ProjectDto | undefined> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) return undefined;

    const material = (project.materials as any).id(materialId);
    if (!material) return undefined;

    material.currentPrice = newPrice;
    material.priceHistory.push({ date: new Date(), price: newPrice });

    await project.save();
    return this.mapToDto(project);
  }

  async deleteMaterial(projectId: string, materialId: string): Promise<ProjectDto | undefined> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) return undefined;

    const material = (project.materials as any).id(materialId);
    if (material) {
      material.deleteOne();
      await project.save();
    }
    return this.mapToDto(project);
  }

  async addProgressUpdate(projectId: string, update: { text: string; images: string[] }): Promise<ProjectDto | undefined> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) return undefined;

    project.progressUpdates.push({
      text: update.text,
      images: update.images,
      date: new Date(),
    } as any);

    await project.save();
    
    // Notify assigned users via Telegram
    this.telegramService.notifyProjectUpdate(projectId, project.name, update.text, update.images);
    
    return this.mapToDto(project);
  }

  private mapToDto(doc: any): ProjectDto {
    return {
      id: doc._id.toString(),
      name: doc.name,
      location: doc.location,
      status: doc.status,
      value: doc.value,
      image: doc.image,
      materials: (doc.materials || []).map((m: any) => ({
        id: m._id.toString(),
        name: m.name,
        unit: m.unit,
        quantity: m.quantity,
        initialPrice: m.initialPrice,
        currentPrice: m.currentPrice,
        priceHistory: (m.priceHistory || []).map((ph: any) => ({
          date: ph.date instanceof Date ? ph.date.toISOString() : ph.date,
          price: ph.price,
        })),
      })),
      progressUpdates: (doc.progressUpdates || []).map((pu: any) => ({
        text: pu.text,
        images: pu.images || [],
        date: pu.date instanceof Date ? pu.date.toISOString() : pu.date,
      })),
      ownerId: doc.ownerId,
      approvalStatus: doc.approvalStatus,
      isPublic: doc.isPublic,
    };
  }
}
