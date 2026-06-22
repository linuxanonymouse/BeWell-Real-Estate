import { TeamService } from './team.service';
import type { TeamMember } from './team.service';
export declare class TeamController {
    private readonly teamService;
    constructor(teamService: TeamService);
    findAll(): TeamMember[];
    findOne(id: string): TeamMember | undefined;
    create(member: Omit<TeamMember, 'id'>): TeamMember;
    update(id: string, data: Partial<TeamMember>): TeamMember | undefined;
    delete(id: string): {
        deleted: boolean;
    };
}
