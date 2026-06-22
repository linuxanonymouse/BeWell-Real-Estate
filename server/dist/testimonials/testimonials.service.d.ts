export interface Testimonial {
    id: string;
    quote: string;
    author: string;
    role: string;
    company: string;
}
export declare class TestimonialsService {
    private testimonials;
    findAll(): Testimonial[];
    findOne(id: string): Testimonial | undefined;
    create(testimonial: Omit<Testimonial, 'id'>): Testimonial;
    update(id: string, data: Partial<Testimonial>): Testimonial | undefined;
    delete(id: string): boolean;
}
