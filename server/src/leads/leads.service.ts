import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'New' | 'Contacted' | 'Converted' | 'Lost';
  createdAt: Date;
}

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);
  private readonly dataPath = path.join(__dirname, '..', '..', 'data', 'leads.json');

  private readonly defaultLeads: Lead[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 555-0123',
      message: 'I am interested in the Rosewood Heights property. Could we schedule a viewing?',
      status: 'New',
      createdAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      message: 'Looking for a 3-bedroom apartment in Istanbul.',
      status: 'Contacted',
      createdAt: new Date(Date.now() - 86400000 * 5),
    }
  ];

  private leads: Lead[];

  constructor() {
    this.leads = this.loadFromDisk();
  }

  private loadFromDisk(): Lead[] {
    try {
      if (fs.existsSync(this.dataPath)) {
        const raw = fs.readFileSync(this.dataPath, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data) && data.length > 0) {
          this.logger.log('Loaded leads from disk');
          return data.map((l: any) => ({ ...l, createdAt: new Date(l.createdAt) }));
        }
      }
    } catch (err) {
      this.logger.warn('Failed to load leads from disk, using defaults', err);
    }
    return [...this.defaultLeads];
  }

  private saveToDisk(): void {
    try {
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataPath, JSON.stringify(this.leads, null, 2), 'utf-8');
      this.logger.log('Saved leads to disk');
    } catch (err) {
      this.logger.error('Failed to save leads to disk', err);
    }
  }

  findAll(): Lead[] {
    return this.leads;
  }

  findOne(id: string): Lead | undefined {
    return this.leads.find(l => l.id === id);
  }

  create(lead: Omit<Lead, 'id' | 'createdAt'>): Lead {
    const maxId = this.leads.reduce((max, l) => Math.max(max, parseInt(l.id) || 0), 0);
    const newLead: Lead = {
      ...lead,
      id: String(maxId + 1),
      createdAt: new Date(),
    };
    this.leads.push(newLead);
    this.saveToDisk();
    return newLead;
  }

  updateStatus(id: string, status: Lead['status']): Lead | undefined {
    const index = this.leads.findIndex(l => l.id === id);
    if (index === -1) return undefined;
    this.leads[index] = { ...this.leads[index], status };
    this.saveToDisk();
    return this.leads[index];
  }

  delete(id: string): boolean {
    const index = this.leads.findIndex(l => l.id === id);
    if (index === -1) return false;
    this.leads.splice(index, 1);
    this.saveToDisk();
    return true;
  }
}
