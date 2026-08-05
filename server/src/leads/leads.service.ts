import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './leads.schema';
import * as fs from 'fs';
import * as path from 'path';

export interface LeadDto {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status?: string;
  createdAt?: string;
}

@Injectable()
export class LeadsService implements OnModuleInit {
  private readonly logger = new Logger(LeadsService.name);
  private readonly dataPath = path.join(__dirname, '..', '..', 'data', 'leads.json');

  constructor(@InjectModel(Lead.name) private leadModel: Model<LeadDocument>) {}

  async onModuleInit() {
    const count = await this.leadModel.countDocuments().exec();
    if (count === 0) {
      try {
        if (fs.existsSync(this.dataPath)) {
          const raw = fs.readFileSync(this.dataPath, 'utf-8');
          const data = JSON.parse(raw);
          if (Array.isArray(data) && data.length > 0) {
            await this.leadModel.insertMany(data.map(({ id, ...rest }) => rest));
            this.logger.log('Seeded leads from disk');
          }
        }
      } catch (err) {
        this.logger.error('Failed to seed leads from disk', err);
      }
    }
  }

  async findAll(): Promise<LeadDto[]> {
    const leads = await this.leadModel.find().sort({ createdAt: -1 }).exec();
    return leads.map(l => this.mapToDto(l));
  }

  async findOne(id: string): Promise<LeadDto | undefined> {
    const l = await this.leadModel.findById(id).exec();
    return l ? this.mapToDto(l) : undefined;
  }

  async create(lead: Omit<LeadDto, 'id'>): Promise<LeadDto> {
    const newLead = new this.leadModel({
      ...lead,
      status: lead.status || 'New',
      createdAt: lead.createdAt || new Date().toISOString()
    });
    const l = await newLead.save();
    return this.mapToDto(l);
  }

  async update(id: string, data: Partial<LeadDto>): Promise<LeadDto | undefined> {
    const l = await this.leadModel.findByIdAndUpdate(id, data, { new: true }).exec();
    return l ? this.mapToDto(l) : undefined;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.leadModel.findByIdAndDelete(id).exec();
    return res !== null;
  }

  private mapToDto(doc: any): LeadDto {
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      message: doc.message,
      status: doc.status,
      createdAt: doc.createdAt
    };
  }
}
