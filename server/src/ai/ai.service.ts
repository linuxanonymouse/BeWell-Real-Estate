import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../projects/projects.schema';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  private readonly modelName = process.env.OLLAMA_MODEL || 'gemma3';

  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>
  ) {}

  private getCompanyContext(): string {
    return `
=== B WELL REAL ESTATE — COMPANY KNOWLEDGE BASE ===

TAGLINE: "We don't just build buildings, we build legacies."

ABOUT:
B Well Real Estate is redefining urban living in Ethiopia through visionary architecture, uncompromising quality, and a profound commitment to creating elevated communities. For us, the word "luxury" is not a vague promise — it is a measurable standard. It means securing prime locations in Ethiopia's most exclusive diplomatic areas. It means sourcing globally vetted, premium materials. It means applying unparalleled craftsmanship to every finish and designing expansive, intelligent spaces that prioritize your daily comfort. We operate on a foundation of trust and a philosophy of growing together with our clients.

THE MEANING BEHIND "B WELL":
Built Well. Live Well. Be Well.
The name B Well comes from a simple but profound idea: when a home is built well, you can live well and be well. We see luxury as more than beautiful finishes or impressive architecture. It is in the structural integrity of the construction, the exacting care taken with each detail, and the comfort and sense of home a property provides. From the foundation to the final functional elements, we focus on creating homes that are beautiful, practical, and built to last.

VISION:
To be one of the leading luxury real estate developers in Ethiopia, setting new benchmarks for high-end urban living. By focusing on exclusive diplomatic areas and premier properties, our vision is to transform the skyline while respecting the rich cultural heritage of our surroundings — turning the aspirations of our clients into enduring realities.

FOUNDERS:
- Muhammad (Co-Founder): A talented real estate developer and project manager with over 10 years of extensive experience working with major industry leaders. His strategic oversight and dedication to execution ensure that every project meets rigorous standards for material quality and operational success.
- Nebil (Co-Founder): A Canadian professional bringing over 10 years of experience in construction. His deep technical knowledge and international perspective infuse global standards of craftsmanship and structural integrity into the Ethiopian market.

FOUNDED: 2022 (4+ years of experience)

CORE VALUES:
1. Quality & Craftsmanship (Built Well): Luxury starts with the materials. We source the finest stone, wood, and fixtures globally, and enforce rigorous construction standards to ensure every structural element and surface finish stands the test of time.
2. Thoughtful Design (Live Well): True luxury is how a space works for you. Our architecture blends contemporary aesthetics with practical, intelligent floor plans that maximize natural light, space, and everyday functionality.
3. Living Well (Be Well): We create more than structures; we build environments in premium, secure locations that provide a profound sense of home, well-being, and a higher standard of living.
4. Trust & Transparency: We believe in building lasting partnerships with our clients, operating with absolute reliability, clear communication, and a shared vision for growing together.

LOCATION: Ethiopia, focusing on exclusive diplomatic areas in Addis Ababa.

CONTACT:
- Email: info@bewell.com
- Phone: +251 912 345 6789
- Website: bewell.com

WHY BUY FROM B WELL:
- Prime locations in Ethiopia's most exclusive diplomatic areas
- Globally vetted, premium materials
- Unparalleled craftsmanship on every finish
- Expansive, intelligent spaces that prioritize daily comfort
- Foundation of trust and philosophy of growing together with clients
- Co-founders with combined 20+ years of real estate and construction experience
- International standards of quality (Canadian construction expertise)
- Investment in growing Ethiopian luxury market
- Properties built to last — beautiful, practical, and enduring

=== END OF COMPANY KNOWLEDGE BASE ===
`;
  }

  async generateChatResponse(userMessage: string): Promise<string> {
    try {
      // Fetch live project data from database
      const projects = await this.projectModel.find().exec();
      const projectsContext = projects.length > 0
        ? projects.map(p => 
            `- ${p.name}: Status: ${p.status}, Location: ${p.location}, Value: ${p.value}${p.description ? ', Description: ' + p.description : ''}`
          ).join('\n')
        : '- No projects currently listed';

      const systemPrompt = `You are the AI assistant for B Well Real Estate, a luxury real estate developer in Ethiopia. You are knowledgeable, warm, professional, and helpful.

${this.getCompanyContext()}

=== CURRENT PROJECTS ===
${projectsContext}
=== END PROJECTS ===

INSTRUCTIONS:
1. Answer ALL questions using the knowledge base above. You have comprehensive information about B Well — use it.
2. Be conversational, warm, and professional. You represent a luxury brand.
3. When asked about founders, the company, values, vision, why to buy, etc. — answer confidently using the information provided.
4. When asked about projects, use the live project data above.
5. For pricing or purchase inquiries, provide what info you have and suggest scheduling a consultation for detailed discussions.
6. Keep responses concise but informative (2-4 sentences for simple questions, more for detailed ones).
7. If asked something truly outside the scope of real estate or B Well (like math problems, coding, politics), politely redirect to B Well topics.
8. Never say "I don't know" about B Well information that IS in your knowledge base.
9. Be proud of the brand. Convey luxury, trust, and excellence.
10. You may use bullet points or formatting when listing multiple items.`;

      try {
        const response = await fetch(`${this.ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.modelName,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ],
            stream: false,
            options: { 
              temperature: 0.3, 
              num_predict: 300,
              top_p: 0.9,
            }
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          let reply = (data.message?.content || data.response || '').trim();
          if (reply.length > 600) reply = reply.substring(0, 600).replace(/[^.]*$/, '');
          if (reply) return reply;
        } else {
          this.logger.warn(`Ollama returned status ${response.status}`);
        }
      } catch (e) {
        this.logger.warn(`Ollama unreachable: ${e.message}`);
      }

      // ── Fallback: deterministic responses if Ollama is down ──
      return this.getFallbackResponse(userMessage, projects);
    } catch (error) {
      this.logger.error(`Error generating AI response: ${error.message}`);
      return "I apologize, but I'm experiencing technical difficulties. Please try again later or contact our team directly at info@bewell.com.";
    }
  }

  private getFallbackResponse(userMessage: string, projects: Project[]): string {
    const msg = userMessage.toLowerCase().trim().replace(/[?!.]/g, '');

    // Greetings
    if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|sup|yo|howdy)$/i.test(msg)) {
      return "Hello! Welcome to B Well Real Estate — where we don't just build buildings, we build legacies. How can I assist you today?";
    }

    // Thanks
    if (/^(ok|okay|thanks|thank you|thx|cool|great|awesome|got it|alright|sure|nice|bye|goodbye)$/i.test(msg) || msg.startsWith('thank')) {
      return "You're welcome! Feel free to reach out anytime. We're here to help you find your dream property.";
    }

    // Founders
    if (msg.includes('founder') || msg.includes('who started') || msg.includes('who created') || msg.includes('nebil') || msg.includes('muhammad')) {
      return "B Well Real Estate was co-founded by Muhammad and Nebil. Muhammad is a talented real estate developer and project manager with over 10 years of experience working with major industry leaders. Nebil is a Canadian professional bringing over 10 years of construction experience, infusing global standards of craftsmanship into the Ethiopian market. Together, their complementary expertise forms the bedrock of our company.";
    }

    // About / What is B Well
    if (msg.includes('about') || msg.includes('what is') || msg.includes('who is') || msg.includes('tell me about') || msg.includes('b well') || msg.includes('be well') || msg.includes('bwell')) {
      return "B Well Real Estate is redefining urban living in Ethiopia through visionary architecture, uncompromising quality, and a profound commitment to creating elevated communities. Our name stands for 'Built Well. Live Well. Be Well.' — the idea that when a home is built well, you can live well and be well. Founded in 2022 by Muhammad and Nebil, we specialize in high-end properties in Ethiopia's most exclusive diplomatic areas.";
    }

    // Why buy
    if (msg.includes('why') && (msg.includes('buy') || msg.includes('choose') || msg.includes('invest') || msg.includes('should'))) {
      return "Here's why clients choose B Well:\n• Prime locations in Ethiopia's most exclusive diplomatic areas\n• Globally vetted, premium materials and unparalleled craftsmanship\n• Expansive, intelligent spaces designed for daily comfort\n• Co-founders with combined 20+ years of industry experience\n• International construction standards (Canadian expertise)\n• A foundation of trust and transparency\n\nWe don't just build structures — we create communities that elevate the standard of living.";
    }

    // Projects
    if (msg.includes('project')) {
      if (projects.length > 0) {
        return `Here are our current projects:\n${projects.map(p => `• ${p.name} — ${p.status} in ${p.location} (${p.value})`).join('\n')}\n\nWould you like to know more about any specific project?`;
      }
      return "We're currently preparing our project portfolio. Please schedule a consultation to learn about our upcoming developments!";
    }

    // Contact
    if (msg.includes('contact') || msg.includes('reach') || msg.includes('call') || msg.includes('email') || msg.includes('phone')) {
      return "You can reach us at:\n• Email: info@bewell.com\n• Phone: +251 912 345 6789\n\nOr use the 'Schedule a Consultation' button on our website. We'd love to hear from you!";
    }

    // Price / invest / buy
    if (msg.includes('invest') || msg.includes('buy') || msg.includes('purchase') || msg.includes('price') || msg.includes('cost')) {
      return "For detailed pricing and investment opportunities, we'd love to schedule a personal consultation with you. Our team can discuss availability, floor plans, and payment options tailored to your needs. Contact us at info@bewell.com or +251 912 345 6789.";
    }

    // Vision
    if (msg.includes('vision') || msg.includes('mission') || msg.includes('goal')) {
      return "Our vision is to be one of the leading luxury real estate developers in Ethiopia, setting new benchmarks for high-end urban living. We aim to transform the skyline while respecting the rich cultural heritage of our surroundings — turning the aspirations of our clients into enduring realities.";
    }

    // Values
    if (msg.includes('value') || msg.includes('believe') || msg.includes('principle')) {
      return "Our core values are:\n1. Quality & Craftsmanship (Built Well) — sourcing the finest materials globally\n2. Thoughtful Design (Live Well) — intelligent spaces that maximize comfort\n3. Living Well (Be Well) — premium environments for well-being\n4. Trust & Transparency — lasting partnerships with clear communication";
    }

    // Location
    if (msg.includes('where') || msg.includes('location') || msg.includes('area') || msg.includes('addis')) {
      return "B Well Real Estate focuses on Ethiopia's most exclusive diplomatic areas in Addis Ababa. We carefully select prime locations that offer security, prestige, and long-term value for our clients.";
    }

    // Default
    return `Thank you for your interest in B Well Real Estate! I can help you with information about our company, projects, founders, values, locations, and investment opportunities. What would you like to know?`;
  }
}
