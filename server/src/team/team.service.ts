import { Injectable } from '@nestjs/common';

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
  private members: TeamMember[] = [
    { id: '1', name: 'Haris Lemene', role: 'Chief Executive Officer', department: 'Leadership' },
    { id: '2', name: 'Maryam Rose', role: 'Managing Director', department: 'Leadership' },
    { id: '3', name: 'Fahad Khan', role: 'Head of Construction', department: 'Engineering' },
    { id: '4', name: 'David Allen', role: 'Head of Architecture', department: 'Design' },
  ];

  findAll(): TeamMember[] {
    return this.members;
  }

  findOne(id: string): TeamMember | undefined {
    return this.members.find(m => m.id === id);
  }

  create(member: Omit<TeamMember, 'id'>): TeamMember {
    const newMember = { ...member, id: String(this.members.length + 1) };
    this.members.push(newMember);
    return newMember;
  }

  update(id: string, data: Partial<TeamMember>): TeamMember | undefined {
    const index = this.members.findIndex(m => m.id === id);
    if (index === -1) return undefined;
    this.members[index] = { ...this.members[index], ...data };
    return this.members[index];
  }

  delete(id: string): boolean {
    const index = this.members.findIndex(m => m.id === id);
    if (index === -1) return false;
    this.members.splice(index, 1);
    return true;
  }
}
