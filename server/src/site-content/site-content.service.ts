import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class SiteContent {
  hero: {
    titleLine1: string;
    titleLine2: string;
    titleHighlight: string;
    subtitle: string;
  };
  projectsSection: {
    titleLine1: string;
    titleLine2: string;
    titleHighlight: string;
    subtitle: string;
  };
  certifications: {
    titleLine1: string;
    titleLine2: string;
    titleHighlight: string;
    subtitle: string;
    quote: string;
    quoteAuthor: string;
  };
  footer: {
    titleLine1: string;
    titleLine2: string;
    titleHighlight: string;
    description: string;
    email: string;
    phone: string;
    location: string;
  };
}

@Injectable()
export class SiteContentService {
  private readonly logger = new Logger(SiteContentService.name);
  private readonly dataPath = path.join(__dirname, '..', '..', 'data', 'site-content.json');

  private readonly defaultContent: SiteContent = {
    hero: {
      titleLine1: "Building",
      titleLine2: "Beyond",
      titleHighlight: "Imagination",
      subtitle: "We don't just build buildings, we build legacies."
    },
    projectsSection: {
      titleLine1: "Iconic Projects",
      titleLine2: "That Define",
      titleHighlight: "Tomorrow",
      subtitle: "Explore our signature projects across prime locations."
    },
    certifications: {
      titleLine1: "Trusted By",
      titleLine2: "Those Who",
      titleHighlight: "Know Excellence",
      subtitle: "Our commitment to quality and timely delivery has earned us the trust of industry leaders.",
      quote: "\"Their dedication, professionalism, and exceptional execution have made them our most trusted development partner.\"",
      quoteAuthor: "CEO, MVP Developers"
    },
    footer: {
      titleLine1: "Let's Build",
      titleLine2: "The Future",
      titleHighlight: "Together",
      description: "Building more than structures, we build trust, relationships, and a better tomorrow.",
      email: "info@bewell.com",
      phone: "+251 912 345 6789",
      location: "Addis Ababa"
    }
  };

  private content: SiteContent;

  constructor() {
    this.content = this.loadFromDisk();
  }

  private loadFromDisk(): SiteContent {
    try {
      if (fs.existsSync(this.dataPath)) {
        const raw = fs.readFileSync(this.dataPath, 'utf-8');
        const data = JSON.parse(raw);
        this.logger.log('Loaded site content from disk');
        return { ...this.defaultContent, ...data };
      }
    } catch (err) {
      this.logger.warn('Failed to load site content from disk, using defaults', err);
    }
    return { ...this.defaultContent };
  }

  private saveToDisk(): void {
    try {
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataPath, JSON.stringify(this.content, null, 2), 'utf-8');
      this.logger.log('Saved site content to disk');
    } catch (err) {
      this.logger.error('Failed to save site content to disk', err);
    }
  }

  getContent(): SiteContent {
    return this.content;
  }

  updateContent(data: SiteContent): SiteContent {
    this.content = {
      ...this.content,
      ...data,
      hero: { ...this.content.hero, ...(data.hero || {}) },
      projectsSection: { ...this.content.projectsSection, ...(data.projectsSection || {}) },
      certifications: { ...this.content.certifications, ...(data.certifications || {}) },
      footer: { ...this.content.footer, ...(data.footer || {}) },
    };
    this.saveToDisk();
    return this.content;
  }
}
