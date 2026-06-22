import { ProjectsService } from './projects.service';
import type { Project } from './projects.service';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    findAll(): Project[];
    findOne(id: string): Project | undefined;
}
