import { Controller, Post, Body, Get, Put, UseGuards } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('contact')
  async handleContactSubmission(@Body() data: any) {
    const message = `
<b>New Contact Inquiry</b>
<b>Name:</b> ${data.name}
<b>Email:</b> ${data.email}
<b>Phone:</b> ${data.phone || 'N/A'}

<b>Message:</b>
${data.message}
    `;

    const success = await this.telegramService.sendNotification(message);
    return { success };
  }

  @UseGuards(JwtAuthGuard)
  @Get('settings')
  async getSettings() {
    const settings = await this.telegramService.getSettings();
    return {
      token: settings.token ? '***' + settings.token.slice(-4) : '',
      chatId: settings.chatId
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('settings')
  async updateSettings(@Body() body: { token: string, chatId: string }) {
    return this.telegramService.updateSettings(body.token, body.chatId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('test')
  async sendTestNotification() {
    const message = `<b>Test Notification</b>\nThis is a test message from your Be Well Admin Dashboard.`;
    const success = await this.telegramService.sendNotification(message);
    return { success };
  }
}
