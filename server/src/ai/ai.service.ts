import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../projects/projects.schema';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  private readonly modelName = 'tinyllama';

  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>
  ) {}

  async generateChatResponse(userMessage: string): Promise<string> {
    try {
      const projects = await this.projectModel.find({ isPublic: true }).exec();
      const msg = userMessage.toLowerCase().trim().replace(/[?!.]/g, '');

      // ── Deterministic responses ──
      // TinyLlama (1.1B) hallucinates heavily, so we handle all common intents in code.

      // Greetings
      if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|sup|yo|howdy|what'?s up)$/i.test(msg)) {
        return "Hello! Welcome to B Well Real Estate. How can I assist you today?";
      }

      // Thanks / acknowledgements
      if (/^(ok|okay|thanks|thank you|thx|cool|great|awesome|got it|alright|sure|nice|bye|goodbye|see you)$/i.test(msg) || msg.startsWith('thank')) {
        return "You're welcome! Feel free to reach out anytime if you have more questions about our properties.";
      }

      // About B Well
      if ((msg.includes('about') || msg.includes('what is') || msg.includes('who is') || msg.includes('tell me')) &&
          (msg.includes('b well') || msg.includes('be well') || msg.includes('bwell') || msg.includes('your company') || msg.includes('you'))) {
        return "B Well Real Estate is a premier developer of luxury properties. Our name 'B Well' is inspired by a Wishing Well — a symbol of hope, prosperity, and the fulfillment of dreams. Just as people cast wishes into a well, we help clients turn their dreams of luxury living into reality. We currently have " + projects.length + " projects across multiple prestigious locations worldwide.";
      }

      // How many projects
      if (msg.includes('how many') && msg.includes('project')) {
        return `We currently have ${projects.length} projects in our public portfolio:\n${projects.map(p => `• ${p.name} — ${p.status} in ${p.location}`).join('\n')}\n\nWould you like details on any specific project?`;
      }

      // List projects / show projects / what projects
      if (msg.includes('project') && (msg.includes('list') || msg.includes('show') || msg.includes('what') || msg.includes('all') || msg.includes('tell'))) {
        return `Here are our current projects:\n${projects.map(p => `• ${p.name} — ${p.status} in ${p.location} (${p.value})`).join('\n')}\n\nWould you like to know more about any of them?`;
      }

      // Specific project by name
      for (const p of projects) {
        const pName = p.name.toLowerCase();
        if (msg.includes(pName) || pName.split(' ').some(word => word.length > 3 && msg.includes(word))) {
          return `${p.name} is a ${p.status.toLowerCase()} project located in ${p.location} with a value of ${p.value}. Would you like to know more or schedule a visit?`;
        }
      }

      // Location queries
      if (msg.includes('where') || msg.includes('location') || msg.includes('city') || msg.includes('country')) {
        const locations = [...new Set(projects.map(p => p.location))];
        return `Our projects are located in: ${locations.join(', ')}. Would you like details about projects in a specific location?`;
      }

      // Specific location mentioned
      for (const p of projects) {
        const loc = p.location.toLowerCase();
        if (msg.includes(loc)) {
          const locProjects = projects.filter(pr => pr.location.toLowerCase() === loc);
          return `We have ${locProjects.length} project(s) in ${p.location}:\n${locProjects.map(pr => `• ${pr.name} — ${pr.status} (${pr.value})`).join('\n')}`;
        }
      }

      // Status queries
      if (msg.includes('completed') || msg.includes('finished') || msg.includes('done')) {
        const completed = projects.filter(p => p.status.toLowerCase() === 'completed');
        if (completed.length > 0) {
          return `We have ${completed.length} completed project(s):\n${completed.map(p => `• ${p.name} in ${p.location} (${p.value})`).join('\n')}`;
        }
        return "We don't have any completed projects listed at the moment.";
      }

      if (msg.includes('under construction') || msg.includes('building') || msg.includes('ongoing')) {
        const uc = projects.filter(p => p.status.toLowerCase() === 'under construction');
        if (uc.length > 0) {
          return `We have ${uc.length} project(s) currently under construction:\n${uc.map(p => `• ${p.name} in ${p.location} (${p.value})`).join('\n')}`;
        }
        return "We don't have any projects under construction at the moment.";
      }

      if (msg.includes('planning') || msg.includes('planned') || msg.includes('upcoming') || msg.includes('future')) {
        const planned = projects.filter(p => p.status.toLowerCase() === 'planning');
        if (planned.length > 0) {
          return `We have ${planned.length} project(s) in the planning stage:\n${planned.map(p => `• ${p.name} in ${p.location} (${p.value})`).join('\n')}`;
        }
        return "We don't have any projects in the planning stage at the moment.";
      }

      // Contact / invest / visit
      if (msg.includes('contact') || msg.includes('reach') || msg.includes('call') || msg.includes('email') || msg.includes('phone')) {
        return "You can reach our team by using the 'Schedule a Consultation' button on our website. We'd love to hear from you!";
      }

      if (msg.includes('invest') || msg.includes('buy') || msg.includes('purchase') || msg.includes('price') || msg.includes('cost')) {
        return "For investment and purchasing inquiries, please schedule a consultation through our website. Our team will be happy to discuss pricing, availability, and investment opportunities.";
      }

      // Value queries
      if (msg.includes('value') || msg.includes('worth') || msg.includes('total')) {
        return `Here are our projects and their values:\n${projects.map(p => `• ${p.name} — ${p.value}`).join('\n')}`;
      }

      // Generic project mention
      if (msg.includes('project')) {
        return `Here are our current projects:\n${projects.map(p => `• ${p.name} — ${p.status} in ${p.location} (${p.value})`).join('\n')}\n\nFeel free to ask about any specific project!`;
      }

      // ── Scope guard: reject out-of-scope questions ──
      const bwellKeywords = ['b well', 'be well', 'bwell', 'real estate', 'property', 'project',
        'luxury', 'building', 'construction', 'apartment', 'villa', 'tower', 'residence',
        'invest', 'buy', 'purchase', 'rent', 'location', 'dubai', 'istanbul', 'miami',
        'lahore', 'riyadh', 'schedule', 'consultation', 'visit', 'office', 'team',
        'developer', 'wishing well', 'portfolio'];
      
      // Also check if any project name is mentioned
      const mentionsProject = projects.some(p => {
        const pName = p.name.toLowerCase();
        return msg.includes(pName) || pName.split(' ').some(w => w.length > 3 && msg.includes(w));
      });
      
      const isInScope = mentionsProject || bwellKeywords.some(kw => msg.includes(kw));
      
      if (!isInScope) {
        return "I appreciate your question, but I'm only able to assist with topics related to B Well Real Estate — such as our projects, locations, investment opportunities, and consultations. Is there anything about B Well I can help you with?";
      }

      // ── Last resort: TinyLlama for in-scope questions we didn't match ──
      try {
        const contextStr = projects.map(p => 
          `- ${p.name}: ${p.status}, ${p.location}, ${p.value}`
        ).join('\n');

        const response = await fetch(`${this.ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.modelName,
            messages: [
              { role: 'system', content: `You are a receptionist for B Well Real Estate. Projects:\n${contextStr}\nAnswer in 1-2 sentences ONLY using the data above. Do NOT invent any details. If the question is not about B Well, say you can only help with B Well topics.` },
              { role: 'user', content: userMessage }
            ],
            stream: false,
            options: { temperature: 0.1, num_predict: 80 }
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          let reply = (data.message?.content || data.response || '').trim();
          if (reply.length > 300) reply = reply.substring(0, 300).replace(/[^.]*$/, '');
          if (reply) return reply;
        }
      } catch (e) {
        this.logger.warn(`Ollama unreachable: ${e.message}`);
      }

      return `I can help you with information about our ${projects.length} projects, locations, and consultations. Could you rephrase your question?`;
    } catch (error) {
      this.logger.error(`Error generating AI response: ${error.message}`);
      return "I apologize, but I'm experiencing technical difficulties. Please try again later or contact our team directly.";
    }
  }
}
