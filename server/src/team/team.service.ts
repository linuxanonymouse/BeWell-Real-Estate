import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio?: string;
  image?: string;
}

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);
  private readonly dataPath = path.join(__dirname, '..', '..', 'data', 'team.json');

  private readonly defaultMembers: TeamMember[] = [
    { id: '1', name: 'Haris Lemene', role: 'Chief Executive Officer', department: 'Leadership' },
    { id: '2', name: 'Maryam Rose', role: 'Managing Director', department: 'Leadership' },
    { id: '3', name: 'Fahad Khan', role: 'Head of Construction', department: 'Engineering' },
    { id: '4', name: 'David Allen', role: 'Head of Architecture', department: 'Design' },
  ];

  private members: TeamMember[];

  constructor() {
    this.members = this.loadFromDisk();
  }

  private loadFromDisk(): TeamMember[] {
    try {
      if (fs.existsSync(this.dataPath)) {
        const raw = fs.readFileSync(this.dataPath, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data) && data.length > 0) {
          this.logger.log('Loaded team members from disk');
          return data;
        }
      }
    } catch (err) {
      this.logger.warn('Failed to load team from disk, using defaults', err);
    }
    return [...this.defaultMembers];
  }

  private saveToDisk(): void {
    try {
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataPath, JSON.stringify(this.members, null, 2), 'utf-8');
      this.logger.log('Saved team members to disk');
    } catch (err) {
      this.logger.error('Failed to save team to disk', err);
    }
  }

  findAll(): TeamMember[] {
    return this.members;
  }

  findOne(id: string): TeamMember | undefined {
    return this.members.find(m => m.id === id);
  }

  create(member: Omit<TeamMember, 'id'>): TeamMember {
    const maxId = this.members.reduce((max, m) => Math.max(max, parseInt(m.id) || 0), 0);
    const newMember = { ...member, id: String(maxId + 1) };
    this.members.push(newMember);
    this.saveToDisk();
    return newMember;
  }

  update(id: string, data: Partial<TeamMember>): TeamMember | undefined {
    const index = this.members.findIndex(m => m.id === id);
    if (index === -1) return undefined;
    this.members[index] = { ...this.members[index], ...data };
    this.saveToDisk();
    return this.members[index];
  }

  delete(id: string): boolean {
    const index = this.members.findIndex(m => m.id === id);
    if (index === -1) return false;
    this.members.splice(index, 1);
    this.saveToDisk();
    return true;
  }
}
