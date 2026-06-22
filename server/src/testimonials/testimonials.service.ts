import { Injectable } from '@nestjs/common';

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
}

@Injectable()
export class TestimonialsService {
  private testimonials: Testimonial[] = [
    {
      id: '1',
      quote: 'Their dedication, professionalism, and exceptional execution have made them our most trusted development partner.',
      author: 'Jonathan Sterling',
      role: 'CEO',
      company: 'MVP Developers',
    },
    {
      id: '2',
      quote: 'BeWell transformed our vision into a landmark. The attention to detail was absolutely extraordinary.',
      author: 'Sarah Mitchell',
      role: 'Director',
      company: 'Horizon Properties',
    },
  ];

  findAll(): Testimonial[] {
    return this.testimonials;
  }

  findOne(id: string): Testimonial | undefined {
    return this.testimonials.find(t => t.id === id);
  }

  create(testimonial: Omit<Testimonial, 'id'>): Testimonial {
    const newTestimonial = { ...testimonial, id: String(this.testimonials.length + 1) };
    this.testimonials.push(newTestimonial);
    return newTestimonial;
  }

  update(id: string, data: Partial<Testimonial>): Testimonial | undefined {
    const index = this.testimonials.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    this.testimonials[index] = { ...this.testimonials[index], ...data };
    return this.testimonials[index];
  }

  delete(id: string): boolean {
    const index = this.testimonials.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.testimonials.splice(index, 1);
    return true;
  }
}
