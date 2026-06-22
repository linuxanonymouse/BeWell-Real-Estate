import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { TestimonialsService, Testimonial } from './testimonials.service';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  findAll(): Testimonial[] {
    return this.testimonialsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Testimonial | undefined {
    return this.testimonialsService.findOne(id);
  }

  @Post()
  create(@Body() testimonial: Omit<Testimonial, 'id'>): Testimonial {
    return this.testimonialsService.create(testimonial);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Testimonial>): Testimonial | undefined {
    return this.testimonialsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): { deleted: boolean } {
    return { deleted: this.testimonialsService.delete(id) };
  }
}
