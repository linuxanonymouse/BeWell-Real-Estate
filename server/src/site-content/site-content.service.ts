import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SiteContent, SiteContentDocument } from './site-content.schema';
import * as fs from 'fs';
import * as path from 'path';

export interface SiteContentDto {
  id?: string;
  hero?: any;
  projectsSection?: any;
  certifications?: any;
  footer?: any;
  about?: any;
}

@Injectable()
export class SiteContentService implements OnModuleInit {
  private readonly logger = new Logger(SiteContentService.name);
  private readonly dataPath = path.join(__dirname, '..', '..', 'data', 'site-content.json');

  constructor(@InjectModel(SiteContent.name) private siteContentModel: Model<SiteContentDocument>) {}

  async onModuleInit() {
    let count = await this.siteContentModel.countDocuments().exec();
    if (count === 0) {
      try {
        if (fs.existsSync(this.dataPath)) {
          const raw = fs.readFileSync(this.dataPath, 'utf-8');
          const data = JSON.parse(raw);
          if (data) {
            await new this.siteContentModel(data).save();
            this.logger.log('Seeded site content from disk');
          }
        } else {
            // Seed a default one if doesn't exist on disk
            await new this.siteContentModel({
              hero: { headline: "Welcome to BeWell", subheadline: "Building legacies" },
              projectsSection: { title: "Our Projects" },
              certifications: { title: "Certifications" },
              footer: { text: "© 2026 BeWell" },
              about: { 
                vision: "Our vision is to transform the skyline while respecting the rich cultural heritage of our surroundings.",
                story: "Founded on the principles of excellence and innovation, B Well Real Estate has established itself as the premier developer of luxury properties."
              }
            }).save();
        }
      } catch (err) {
        this.logger.error('Failed to seed site content from disk', err);
      }
    }
  }

  async getContent(): Promise<SiteContentDto> {
    let doc = await this.siteContentModel.findOne().exec();
    if (!doc) {
      doc = await new this.siteContentModel({}).save();
    }
    return this.mapToDto(doc);
  }

  async updateContent(data: SiteContentDto): Promise<SiteContentDto> {
    let doc = await this.siteContentModel.findOne().exec();
    if (!doc) {
      doc = await new this.siteContentModel(data).save();
    } else {
      doc.hero = { ...doc.hero, ...(data.hero || {}) };
      doc.projectsSection = { ...doc.projectsSection, ...(data.projectsSection || {}) };
      doc.certifications = { ...doc.certifications, ...(data.certifications || {}) };
      doc.footer = { ...doc.footer, ...(data.footer || {}) };
      doc.about = { ...doc.about, ...(data.about || {}) };
      await doc.save();
    }
    return this.mapToDto(doc);
  }

  private mapToDto(doc: any): SiteContentDto {
    return {
      id: doc._id.toString(),
      hero: doc.hero,
      projectsSection: doc.projectsSection,
      certifications: doc.certifications,
      footer: doc.footer,
      about: doc.about
    };
  }
}
