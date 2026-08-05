import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectsService } from '../projects/projects.service';
import { LeadsService } from '../leads/leads.service';
import { TelegramSettings, TelegramSettingsDocument } from './telegram.schema';

const TelegramBot = require('node-telegram-bot-api');

type ChatState = 'IDLE' | 'AWAITING_NAME' | 'AWAITING_EMAIL' | 'AWAITING_PHONE' | 'AWAITING_MESSAGE';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: any;
  private chatId: string = process.env.TELEGRAM_CHAT_ID || '';
  private token: string = process.env.TELEGRAM_BOT_TOKEN || '8866256032:AAFMVoEvMYURWWxeJS5zg24FIn7bz_9-4Vc';
  
  private userStates = new Map<number, { state: ChatState, data: any }>();

  constructor(
    @InjectModel(TelegramSettings.name) private telegramModel: Model<TelegramSettingsDocument>,
    private readonly projectsService: ProjectsService,
    @Inject(forwardRef(() => LeadsService))
    private readonly leadsService: LeadsService
  ) {}

  async onModuleInit() {
    let settings = await this.telegramModel.findOne().exec();
    if (!settings) {
      settings = await new this.telegramModel({ token: this.token, chatId: this.chatId }).save();
    } else {
      if (settings.token) this.token = settings.token;
      if (settings.chatId) this.chatId = settings.chatId;
    }
    this.initializeBot();
  }

  private initializeBot() {
    if (!this.token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not provided. Telegram integration is disabled.');
      this.bot = null;
      return;
    }
    try {
      if (this.bot) {
        this.bot.stopPolling();
      }
      this.bot = new TelegramBot(this.token, { polling: true });
      this.logger.log('Telegram bot initialized with polling enabled.');
      this.setupHandlers();
    } catch (error) {
      this.logger.error('Failed to initialize Telegram bot', error);
      this.bot = null;
    }
  }

  private setupHandlers() {
    this.bot.on('message', async (msg: any) => {
      const chatId = msg.chat.id;
      const text = msg.text || '';
      
      if (!this.chatId) {
          this.chatId = chatId.toString();
          await this.saveSettings();
      }

      if (text === '/start') {
        this.userStates.set(chatId, { state: 'IDLE', data: {} });
        return this.sendMainMenu(chatId);
      }
      
      if (text === '/projects') {
        this.userStates.set(chatId, { state: 'IDLE', data: {} });
        return this.sendProjects(chatId);
      }

      if (text === '/consult') {
        return this.startConsultation(chatId);
      }

      const userSession = this.userStates.get(chatId);
      if (userSession && userSession.state !== 'IDLE') {
        return this.handleConversationalState(chatId, text, userSession);
      }

      if (!text.startsWith('/')) {
        this.bot.sendMessage(chatId, "I didn't understand that. Type /start to see what I can do.");
      }
    });

    this.bot.on('callback_query', (query: any) => {
      const chatId = query.message.chat.id;
      const data = query.data;

      if (data === 'action_projects') {
        this.sendProjects(chatId);
      } else if (data === 'action_consult') {
        this.startConsultation(chatId);
      }
      
      this.bot.answerCallbackQuery(query.id);
    });
  }

  private sendMainMenu(chatId: number) {
    const welcomeText = `Welcome to <b>B WELL Real Estate</b>! 🏙️\n\nWe build legacies beyond imagination. How can I assist you today?`;
    const options = {
      parse_mode: 'HTML',
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: '🏢 View Projects Portfolio', callback_data: 'action_projects' }],
          [{ text: '📅 Schedule a Consultation', callback_data: 'action_consult' }]
        ]
      })
    };
    this.bot.sendMessage(chatId, welcomeText, options);
  }

  private async sendProjects(chatId: number) {
    const projects = await this.projectsService.findAll();
    let text = '<b>Our Signature Portfolio</b> 🏗️\n\n';
    
    projects.forEach((p, idx) => {
      text += `${idx + 1}. <b>${p.name}</b>\n`;
      text += `📍 Location: ${p.location}\n`;
      text += `🏢 Status: ${p.status}\n`;
      text += `💰 Value: ${p.value}\n\n`;
    });

    this.bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
  }

  private startConsultation(chatId: number) {
    this.userStates.set(chatId, { state: 'AWAITING_NAME', data: {} });
    this.bot.sendMessage(chatId, "Let's schedule your consultation. First, what is your <b>Full Name</b>?", { parse_mode: 'HTML' });
  }

  private async handleConversationalState(chatId: number, text: string, session: any) {
    if (text === '/cancel') {
        this.userStates.set(chatId, { state: 'IDLE', data: {} });
        return this.bot.sendMessage(chatId, "Consultation request cancelled. Type /start for the main menu.");
    }

    switch (session.state) {
      case 'AWAITING_NAME':
        session.data.name = text;
        session.state = 'AWAITING_EMAIL';
        this.bot.sendMessage(chatId, `Thanks, ${text}! What is your <b>Email Address</b>?`, { parse_mode: 'HTML' });
        break;
      
      case 'AWAITING_EMAIL':
        session.data.email = text;
        session.state = 'AWAITING_PHONE';
        this.bot.sendMessage(chatId, "Got it. Please provide your <b>Phone Number</b> (or type 'skip' if you prefer not to).", { parse_mode: 'HTML' });
        break;
      
      case 'AWAITING_PHONE':
        if (text.toLowerCase() !== 'skip') {
          session.data.phone = text;
        }
        session.state = 'AWAITING_MESSAGE';
        this.bot.sendMessage(chatId, "Lastly, please briefly describe your inquiry or what kind of property you are looking for.");
        break;

      case 'AWAITING_MESSAGE':
        session.data.message = text;
        session.state = 'IDLE';
        
        await this.leadsService.create({
          name: session.data.name,
          email: session.data.email,
          phone: session.data.phone || 'Not provided',
          message: session.data.message,
          status: 'New'
        });

        const confirmText = `<b>Request Received! ✅</b>\n\nThank you, ${session.data.name}. Our team has received your consultation request and will reach out to you shortly.\n\nType /start to return to the main menu.`;
        this.bot.sendMessage(chatId, confirmText, { parse_mode: 'HTML' });
        break;
    }
  }

  async getSettings() {
    let doc = await this.telegramModel.findOne().exec();
    return {
      token: doc?.token || this.token,
      chatId: doc?.chatId || this.chatId
    };
  }

  async updateSettings(token: string, chatId: string) {
    this.token = token;
    this.chatId = chatId;
    await this.saveSettings();
    this.initializeBot();
    return this.getSettings();
  }
  
  private async saveSettings() {
    let doc = await this.telegramModel.findOne().exec();
    if (!doc) {
      await new this.telegramModel({ token: this.token, chatId: this.chatId }).save();
    } else {
      doc.token = this.token;
      doc.chatId = this.chatId;
      await doc.save();
    }
  }

  async sendNotification(message: string): Promise<boolean> {
    if (!this.bot) return false;
    if (!this.chatId) return false;
    
    try {
      await this.bot.sendMessage(this.chatId, message, { parse_mode: 'HTML' });
      return true;
    } catch (error) {
      this.logger.error('Failed to send Telegram notification:', error);
      return false;
    }
  }
}
