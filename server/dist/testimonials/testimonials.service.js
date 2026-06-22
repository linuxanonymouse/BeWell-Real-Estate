"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialsService = void 0;
const common_1 = require("@nestjs/common");
let TestimonialsService = class TestimonialsService {
    testimonials = [
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
    findAll() {
        return this.testimonials;
    }
    findOne(id) {
        return this.testimonials.find(t => t.id === id);
    }
    create(testimonial) {
        const newTestimonial = { ...testimonial, id: String(this.testimonials.length + 1) };
        this.testimonials.push(newTestimonial);
        return newTestimonial;
    }
    update(id, data) {
        const index = this.testimonials.findIndex(t => t.id === id);
        if (index === -1)
            return undefined;
        this.testimonials[index] = { ...this.testimonials[index], ...data };
        return this.testimonials[index];
    }
    delete(id) {
        const index = this.testimonials.findIndex(t => t.id === id);
        if (index === -1)
            return false;
        this.testimonials.splice(index, 1);
        return true;
    }
};
exports.TestimonialsService = TestimonialsService;
exports.TestimonialsService = TestimonialsService = __decorate([
    (0, common_1.Injectable)()
], TestimonialsService);
//# sourceMappingURL=testimonials.service.js.map