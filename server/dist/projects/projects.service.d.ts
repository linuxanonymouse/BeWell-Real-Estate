export interface Project {
    id: string;
    name: string;
    location: string;
    status: string;
    value: string;
    image?: string;
}
export declare class ProjectsService {
    private projects;
    findAll(): Project[];
    findOne(id: string): Project;
}
