import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Project {
  id: string;
  name: string;
  location: string;
  status: string;
  value: string;
  image?: string;
}

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);
  private readonly dataPath = path.join(__dirname, '..', '..', 'data', 'projects.json');

  private readonly defaultProjects: Project[] = [
    { id: '1', name: 'Rosewood Heights', location: 'Dubai', status: 'Under Construction', value: '$450M' },
    { id: '2', name: 'Lemene Tower', location: 'Istanbul', status: 'Completed', value: '$320M' },
    { id: '3', name: 'Rose Vista', location: 'Riyadh', status: 'Planning', value: '$180M' },
    { id: '4', name: 'Lemene Signature', location: 'Lahore', status: 'Completed', value: '$250M' },
    { id: '5', name: 'Rose Bay', location: 'Miami', status: 'Under Construction', value: '$500M' },
  ];

  private projects: Project[];

  constructor() {
    this.projects = this.loadFromDisk();
  }

  private loadFromDisk(): Project[] {
    try {
      if (fs.existsSync(this.dataPath)) {
        const raw = fs.readFileSync(this.dataPath, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data) && data.length > 0) {
          this.logger.log('Loaded projects from disk');
          return data;
        }
      }
    } catch (err) {
      this.logger.warn('Failed to load projects from disk, using defaults', err);
    }
    return [...this.defaultProjects];
  }

  private saveToDisk(): void {
    try {
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataPath, JSON.stringify(this.projects, null, 2), 'utf-8');
      this.logger.log('Saved projects to disk');
    } catch (err) {
      this.logger.error('Failed to save projects to disk', err);
    }
  }

  findAll(): Project[] {
    return this.projects;
  }

  findOne(id: string): Project | undefined {
    return this.projects.find(p => p.id === id);
  }

  create(project: Omit<Project, 'id'>): Project {
    const maxId = this.projects.reduce((max, p) => Math.max(max, parseInt(p.id) || 0), 0);
    const newProject = { ...project, id: String(maxId + 1) };
    this.projects.push(newProject);
    this.saveToDisk();
    return newProject;
  }

  update(id: string, data: Partial<Project>): Project | undefined {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    this.projects[index] = { ...this.projects[index], ...data };
    this.saveToDisk();
    return this.projects[index];
  }

  delete(id: string): boolean {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.projects.splice(index, 1);
    this.saveToDisk();
    return true;
  }
}
