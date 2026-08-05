import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private session: any;

  async onModuleInit() {
    this.logger.log('Initializing local TinyLlama model...');
    try {
      const { getLlama, LlamaChatSession } = await import('node-llama-cpp');
      const llama = await getLlama();
      const modelPath = path.join(process.cwd(), 'models', 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf');
      
      this.logger.log(`Loading model from ${modelPath}`);
      const model = await llama.loadModel({ modelPath });
      const context = await model.createContext();
      
      this.session = new LlamaChatSession({
        contextSequence: context.getSequence(),
        systemPrompt: `You are an elite, professional, and knowledgeable AI assistant for Be Well Real Estate, a luxury real estate development company. 
Your tone should be sophisticated, polite, and extremely helpful. 
You provide insights about high-end properties, architecture, and luxury living.
Answer concisely but thoroughly. If you don't know something, offer to connect them with a human agent.`
      });
      
      this.logger.log('TinyLlama model loaded and ready.');
    } catch (error) {
      this.logger.error('Failed to initialize local TinyLlama model. Check if the model file is downloaded.', error);
    }
  }

  async generateChatResponse(userMessage: string): Promise<string> {
    try {
      if (this.session) {
        // We prompt the local model
        const response = await this.session.prompt(userMessage);
        return response;
      } else {
        this.logger.warn('AI Session not ready yet.');
        return 'The AI model is still initializing or failed to load. Please try again in a moment.';
      }
    } catch (error) {
      this.logger.error('Error generating AI response:', error);
      return 'I apologize, but I am currently experiencing technical difficulties. Please try again later.';
    }
  }
}

