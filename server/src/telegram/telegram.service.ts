import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectsService } from '../projects/projects.service';
import { LeadsService } from '../leads/leads.service';
import { TelegramSettings, TelegramSettingsDocument } from './telegram.schema';
import { User, UserDocument } from '../auth/user.schema';

const TelegramBotModule = require('node-telegram-bot-api');
const TelegramBot = TelegramBotModule.default ? TelegramBotModule.default : (typeof TelegramBotModule === 'function' ? TelegramBotModule : TelegramBotModule.TelegramBot);

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
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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

      // Prevent bot errors from crashing the entire server
      this.bot.on('error', (error) => {
        this.logger.error(`Telegram Bot Error: ${error.message}`);
      });
      
      this.bot.on('polling_error', (error) => {
        this.logger.error(`Telegram Polling Error: ${error.message}`);
      });
      
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

      // Handle /start with a token for account linking
      if (text.startsWith('/start ')) {
        const linkToken = text.replace('/start ', '').trim();
        if (linkToken) {
          return this.handleAccountLink(chatId, linkToken);
        }
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

    this.bot.on('callback_query', async (query: any) => {
      const chatId = query.message.chat.id;
      const data = query.data;

      if (data === 'action_projects') {
        this.sendProjects(chatId);
      } else if (data === 'action_updates') {
        this.sendMyUpdates(chatId);
      } else if (data === 'action_consult') {
        this.startConsultation(chatId);
      }
      
      try {
        this.bot.answerCallbackQuery(query.id);
      } catch (err) {
        this.logger.error('Failed to answer callback query', err);
      }
    });
  }

  private async sendMainMenu(chatId: number) {
    const linkedUser = await this.userModel.findOne({ telegramChatIds: chatId.toString() }).exec();
    
    if (linkedUser) {
      // Personalized menu for linked users
      const welcomeText = `Welcome back, <b>${linkedUser.name}</b>! 🏙️\n\nHow can we help you today?`;
      const options = {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: '🏢 My Projects', callback_data: 'action_projects' }],
            [{ text: '🔔 My Updates', callback_data: 'action_updates' }],
            [{ text: '📝 Request New Project', callback_data: 'action_consult' }],
            [{ text: '💬 Contact Support', callback_data: 'action_consult' }]
          ]
        })
      };
      this.bot.sendMessage(chatId, welcomeText, options);
    } else {
      // Generic menu for guests
      const welcomeText = `Welcome to <b>B WELL Real Estate</b>! 🏙️\n\nWe build legacies beyond imagination. How can I assist you today?`;
      const options = {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: '📅 Schedule a Consultation', callback_data: 'action_consult' }]
          ]
        })
      };
      this.bot.sendMessage(chatId, welcomeText, options);
    }
  }

  private async sendProjects(chatId: number) {
    const user = await this.userModel.findOne({ telegramChatIds: chatId.toString() }).exec();
    
    if (user) {
      if (user.assignedProjectIds && user.assignedProjectIds.length > 0) {
        const allProjects = await this.projectsService.findAll();
        const myProjects = allProjects.filter(p => user.assignedProjectIds.includes(p.id as string));
        
        let text = `<b>Your Assigned Projects, ${user.name}</b> 🏗️\n\n`;
        myProjects.forEach((p, idx) => {
          text += `${idx + 1}. <b>${p.name}</b>\n`;
          text += `📍 Location: ${p.location}\n`;
          text += `🏢 Status: ${p.status}\n`;
          
          if (p.progressUpdates && p.progressUpdates.length > 0) {
            const latestUpdate = p.progressUpdates[p.progressUpdates.length - 1];
            text += `📝 Latest Update: ${latestUpdate.text}\n`;
          }
          text += `\n`;
        });
        return this.bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
      } else {
        // Linked user but no projects
        return this.bot.sendMessage(chatId, '📭 <b>No Projects Found</b>\n\nYou don\'t have any assigned projects yet. Click below to request a new project!', {
          parse_mode: 'HTML',
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: '📝 Request New Project', callback_data: 'action_consult' }]
            ]
          })
        });
      }
    }

    // Default for guests
    return this.bot.sendMessage(chatId, '🔒 <b>Access Restricted</b>\n\nYou must link your account to view your projects. If you are a new client, please schedule a consultation.', {
      parse_mode: 'HTML',
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: '📅 Schedule a Consultation', callback_data: 'action_consult' }]
        ]
      })
    });
  }

  private async sendMyUpdates(chatId: number) {
    const user = await this.userModel.findOne({ telegramChatIds: chatId.toString() }).exec();
    
    if (!user || !user.assignedProjectIds || user.assignedProjectIds.length === 0) {
      return this.bot.sendMessage(chatId, '📭 <b>No Updates</b>\n\nYou don\'t have any assigned projects yet. Contact our team for more information.', { parse_mode: 'HTML' });
    }

    const allProjects = await this.projectsService.findAll();
    const myProjects = allProjects.filter(p => user.assignedProjectIds.includes(p.id as string));
    
    let text = `<b>Latest Updates for ${user.name}</b> 📬\n\n`;
    let hasUpdates = false;

    myProjects.forEach((p) => {
      if (p.progressUpdates && p.progressUpdates.length > 0) {
        hasUpdates = true;
        text += `🏗️ <b>${p.name}</b>\n`;
        // Show last 3 updates
        const recentUpdates = p.progressUpdates.slice(-3).reverse();
        recentUpdates.forEach((u: any) => {
          const date = new Date(u.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          text += `  📝 [${date}] ${u.text}\n`;
        });
        text += `\n`;
      }
    });

    if (!hasUpdates) {
      text += 'No recent updates on your projects. We\'ll notify you when there are new developments!';
    }

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

  private async handleAccountLink(chatId: number, linkToken: string) {
    try {
      const user = await this.userModel.findOne({ telegramLinkToken: linkToken }).exec();
      if (!user) {
        return this.bot.sendMessage(chatId, '❌ <b>Invalid token.</b>\n\nThe token you provided is not valid or has expired. Please check your dashboard for the correct token.', { parse_mode: 'HTML' });
      }

      const chatIdStr = chatId.toString();
      const existingUser = await this.userModel.findOne({ telegramChatIds: chatIdStr }).exec();
      
      if (existingUser) {
        if (existingUser._id.toString() === user._id.toString()) {
          return this.bot.sendMessage(chatId, '✅ <b>Already linked!</b>\n\nThis Telegram account is already linked to your B Well account.', { parse_mode: 'HTML' });
        } else {
          return this.bot.sendMessage(chatId, '❌ <b>Already linked to another account!</b>\n\nThis Telegram account is already linked to a different B Well account. You cannot link it to multiple accounts.', { parse_mode: 'HTML' });
        }
      }

      // Add chatId to user
      user.telegramChatIds.push(chatIdStr);
      await user.save();

      this.bot.sendMessage(chatId, `✅ <b>Account Linked Successfully!</b>\n\nWelcome, <b>${user.name}</b>! Your Telegram is now linked to your B Well Real Estate account.\n\nYou will receive notifications about:\n• Project progress updates\n• Support ticket replies\n• Important announcements\n\nType /start for the main menu.`, { parse_mode: 'HTML' });

      // Notify admin about the link
      if (this.chatId) {
        this.bot.sendMessage(this.chatId, `🔗 <b>New Telegram Link</b>\n\nClient <b>${user.name}</b> (${user.email}) has linked their Telegram account.`, { parse_mode: 'HTML' });
      }
    } catch (error) {
      this.logger.error('Failed to handle account link:', error);
      this.bot.sendMessage(chatId, '❌ An error occurred while linking your account. Please try again later.');
    }
  }

  async sendToUser(userId: string, message: string): Promise<boolean> {
    if (!this.bot) return false;
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user || !user.telegramChatIds || user.telegramChatIds.length === 0) return false;

      for (const chatId of user.telegramChatIds) {
        try {
          await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
        } catch (err) {
          this.logger.error(`Failed to send to chatId ${chatId}:`, err);
        }
      }
      return true;
    } catch (error) {
      this.logger.error('Failed to send user notification:', error);
      return false;
    }
  }

  async notifyAdminTokenReset(userName: string, userEmail: string) {
    if (!this.bot || !this.chatId) return;
    const msg = `🚨 <b>Security Alert: Telegram Token Reset</b>\n\nClient <b>${userName}</b> (${userEmail}) has reset their Telegram link token.\n\nThis could indicate a stolen device. Please verify by contacting the account holder.`;
    try {
      await this.bot.sendMessage(this.chatId, msg, { parse_mode: 'HTML' });
    } catch (err) {
      this.logger.error('Failed to send admin token reset alert to telegram', err);
    }
  }

  async notifyUser(userId: string, text: string, attachmentUrl?: string, attachmentType?: string) {
    if (!this.bot) return;
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user || !user.telegramChatIds || user.telegramChatIds.length === 0) return;
      
      for (const chatId of user.telegramChatIds) {
        try {
          if (attachmentUrl) {
            const isVideo = attachmentType === 'video' || attachmentUrl.match(/\.(mp4|mov|webm)$/i);
            if (isVideo) {
              await this.bot.sendVideo(chatId, attachmentUrl, { caption: text, parse_mode: 'HTML' });
            } else {
              await this.bot.sendPhoto(chatId, attachmentUrl, { caption: text, parse_mode: 'HTML' });
            }
          } else {
            await this.bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
          }
        } catch (err) {
          this.logger.error(`Failed to send message to user ${userId} chat ${chatId}`, err);
        }
      }
    } catch (err) {
      this.logger.error('Failed to lookup user for telegram notification', err);
    }
  }

  async notifyProjectUpdate(projectId: string, projectName: string, updateText: string, imageUrls?: string[]) {
    if (!this.bot) return;
    try {
      const users = await this.userModel.find({ assignedProjectIds: projectId }).exec();
      if (!users.length) return;
      
      for (const user of users) {
        if (!user.telegramChatIds || user.telegramChatIds.length === 0) continue;
        
        for (const chatId of user.telegramChatIds) {
          try {
            const msg = `🚧 <b>Project Update: ${projectName}</b>\n\n${updateText}`;
            if (imageUrls && imageUrls.length > 0) {
              // Send the first media with the caption
              const isVideo = imageUrls[0].match(/\.(mp4|mov|webm)$/i);
              if (isVideo) {
                await this.bot.sendVideo(chatId, imageUrls[0], { caption: msg, parse_mode: 'HTML' });
              } else {
                await this.bot.sendPhoto(chatId, imageUrls[0], { caption: msg, parse_mode: 'HTML' });
              }
              // Send the rest of the media if any
              for (let i = 1; i < imageUrls.length; i++) {
                const isRestVideo = imageUrls[i].match(/\.(mp4|mov|webm)$/i);
                if (isRestVideo) {
                  await this.bot.sendVideo(chatId, imageUrls[i]);
                } else {
                  await this.bot.sendPhoto(chatId, imageUrls[i]);
                }
              }
            } else {
              await this.bot.sendMessage(chatId, msg, { parse_mode: 'HTML' });
            }
          } catch (err) {
            this.logger.error(`Failed to send project update to user ${user.id} chat ${chatId}`, err);
          }
        }
      }
    } catch (err) {
      this.logger.error('Failed to lookup users for project update notification', err);
    }
  }
}
