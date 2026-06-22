export interface TeamMember {
    id: string;
    name: string;
    role: string;
    department: string;
    bio?: string;
    image?: string;
}
export declare class TeamService {
    private members;
    findAll(): TeamMember[];
    findOne(id: string): TeamMember | undefined;
    create(member: Omit<TeamMember, 'id'>): TeamMember;
    update(id: string, data: Partial<TeamMember>): TeamMember | undefined;
    delete(id: string): boolean;
}
