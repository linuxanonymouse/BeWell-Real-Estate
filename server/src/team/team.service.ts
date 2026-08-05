import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeamMember, TeamMemberDocument } from './team.schema';
import * as fs from 'fs';
import * as path from 'path';

export interface TeamMemberDto {
  id?: string;
  name: string;
  role: string;
  image?: string;
  bio?: string;
}

@Injectable()
export class TeamService implements OnModuleInit {
  private readonly logger = new Logger(TeamService.name);
  private readonly dataPath = path.join(__dirname, '..', '..', 'data', 'team.json');

  constructor(@InjectModel(TeamMember.name) private teamModel: Model<TeamMemberDocument>) {}

  async onModuleInit() {
    const count = await this.teamModel.countDocuments().exec();
    if (count === 0) {
      try {
        if (fs.existsSync(this.dataPath)) {
          const raw = fs.readFileSync(this.dataPath, 'utf-8');
          const data = JSON.parse(raw);
          if (Array.isArray(data) && data.length > 0) {
            await this.teamModel.insertMany(data.map(({ id, ...rest }) => rest));
            this.logger.log('Seeded team from disk');
          }
        }
      } catch (err) {
        this.logger.error('Failed to seed team from disk', err);
      }
    }
    // Migrate: strip hardcoded localhost URLs from image fields
    await this.teamModel.updateMany(
      { image: { $regex: '^http://localhost' } },
      [{ $set: { image: { $replaceAll: { input: '$image', find: 'http://localhost:3001', replacement: '' } } } }],
    );
  }

  async findAll(): Promise<TeamMemberDto[]> {
    const members = await this.teamModel.find().exec();
    return members.map(m => this.mapToDto(m));
  }

  async findOne(id: string): Promise<TeamMemberDto | undefined> {
    const m = await this.teamModel.findById(id).exec();
    return m ? this.mapToDto(m) : undefined;
  }

  async create(member: Omit<TeamMemberDto, 'id'>): Promise<TeamMemberDto> {
    const newMember = new this.teamModel(member);
    const m = await newMember.save();
    return this.mapToDto(m);
  }

  async update(id: string, data: Partial<TeamMemberDto>): Promise<TeamMemberDto | undefined> {
    const m = await this.teamModel.findByIdAndUpdate(id, data, { new: true }).exec();
    return m ? this.mapToDto(m) : undefined;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.teamModel.findByIdAndDelete(id).exec();
    return res !== null;
  }

  private mapToDto(doc: any): TeamMemberDto {
    return {
      id: doc._id.toString(),
      name: doc.name,
      role: doc.role,
      image: doc.image,
      bio: doc.bio
    };
  }
}
