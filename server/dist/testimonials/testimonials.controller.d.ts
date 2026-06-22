import { TestimonialsService } from './testimonials.service';
import type { Testimonial } from './testimonials.service';
export declare class TestimonialsController {
    private readonly testimonialsService;
    constructor(testimonialsService: TestimonialsService);
    findAll(): Testimonial[];
    findOne(id: string): Testimonial | undefined;
    create(testimonial: Omit<Testimonial, 'id'>): Testimonial;
    update(id: string, data: Partial<Testimonial>): Testimonial | undefined;
    delete(id: string): {
        deleted: boolean;
    };
}
