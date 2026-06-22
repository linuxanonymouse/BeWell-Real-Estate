import { Injectable } from '@nestjs/common';

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
  private projects: Project[] = [
    { id: '1', name: 'Rosewood Heights', location: 'Dubai', status: 'Under Construction', value: '$450M' },
    { id: '2', name: 'Lemene Tower', location: 'Istanbul', status: 'Completed', value: '$320M' },
    { id: '3', name: 'Rose Vista', location: 'Riyadh', status: 'Planning', value: '$180M' },
    { id: '4', name: 'Lemene Signature', location: 'Lahore', status: 'Completed', value: '$250M' },
    { id: '5', name: 'Rose Bay', location: 'Miami', status: 'Under Construction', value: '$500M' },
  ];

  findAll(): Project[] {
    return this.projects;
  }

  findOne(id: string): Project | undefined {
    return this.projects.find(p => p.id === id);
  }
}
