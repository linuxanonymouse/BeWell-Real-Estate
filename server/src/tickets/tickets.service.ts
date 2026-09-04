import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from './tickets.schema';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @Inject(forwardRef(() => TelegramService)) private telegramService: TelegramService
  ) {}

  async create(clientId: string, clientName: string, department: string, text: string, attachmentUrl?: string, attachmentType?: string) {
    const ticket = await this.ticketModel.create({
      clientId,
      clientName,
      department,
      hasUnreadForAdmin: true,
      hasUnreadForClient: false,
      messages: [{
        senderId: clientId,
        senderName: clientName,
        senderRole: 'client',
        text,
        attachmentUrl,
        attachmentType,
        date: new Date(),
      }],
    });
    return this.mapToDto(ticket);
  }

  async adminCreate(clientId: string, clientName: string, department: string, text: string, senderId: string, senderName: string, senderRole: string, attachmentUrl?: string, attachmentType?: string) {
    const ticket = await this.ticketModel.create({
      clientId,
      clientName,
      department,
      hasUnreadForAdmin: false,
      hasUnreadForClient: true,
      messages: [{
        senderId,
        senderName,
        senderRole,
        text,
        attachmentUrl,
        attachmentType,
        date: new Date(),
      }],
    });
    
    // Notify the user via Telegram
    const deptName = department === 'management' ? 'Management' : 'Support';
    const messageText = text || 'Sent an attachment';
    this.telegramService.notifyUser(
      clientId, 
      `📩 <b>New Message from ${deptName}</b>\n\n${messageText}\n\n<i>Reply to this by logging into your client dashboard.</i>`,
      attachmentUrl,
      attachmentType
    );
    
    return this.mapToDto(ticket);
  }

  async addMessage(ticketId: string, senderId: string, senderName: string, senderRole: string, text: string, attachmentUrl?: string, attachmentType?: string) {
    const ticket = await this.ticketModel.findById(ticketId).exec();
    if (!ticket) return null;

    const isFromAdmin = senderRole === 'superadmin' || senderRole === 'support';
    
    if (isFromAdmin) {
      ticket.hasUnreadForClient = true;
    } else {
      ticket.hasUnreadForAdmin = true;
    }

    ticket.messages.push({
      senderId,
      senderName,
      senderRole,
      text,
      attachmentUrl,
      attachmentType,
      date: new Date(),
    } as any);

    await ticket.save();

    // If it's from staff, notify the client
    if (senderRole === 'superadmin' || senderRole === 'support') {
      const deptName = senderRole === 'superadmin' ? 'Management' : 'Support';
      // If there's an attachment but no text, provide a default caption
      const messageText = text || 'Sent an attachment';
      this.telegramService.notifyUser(
        ticket.clientId, 
        `📩 <b>New reply from ${deptName}</b>\n\n${messageText}\n\n<i>Reply to this by logging into your client dashboard.</i>`,
        attachmentUrl,
        attachmentType
      );
    }

    return this.mapToDto(ticket);
  }

  async findByClient(clientId: string) {
    const tickets = await this.ticketModel.find({ clientId }).sort({ updatedAt: -1 }).exec();
    return tickets.map(t => this.mapToDto(t));
  }

  async findByDepartment(department: string) {
    const tickets = await this.ticketModel.find({ department }).sort({ updatedAt: -1 }).exec();
    return tickets.map(t => this.mapToDto(t));
  }

  async findAll() {
    const tickets = await this.ticketModel.find().sort({ updatedAt: -1 }).exec();
    return tickets.map(t => this.mapToDto(t));
  }

  async findOne(id: string) {
    const ticket = await this.ticketModel.findById(id).exec();
    return ticket ? this.mapToDto(ticket) : null;
  }

  async closeTicket(id: string) {
    const ticket = await this.ticketModel.findByIdAndUpdate(id, { status: 'closed' }, { new: true }).exec();
    return ticket ? this.mapToDto(ticket) : null;
  }

  async getUnreadCount(userId: string, role: string) {
    if (role === 'client') {
      return this.ticketModel.countDocuments({ clientId: userId, hasUnreadForClient: true, status: 'open' }).exec();
    } else {
      return this.ticketModel.countDocuments({ hasUnreadForAdmin: true, status: 'open' }).exec();
    }
  }

  async markAsRead(id: string, role: string) {
    const ticket = await this.ticketModel.findById(id).exec();
    if (!ticket) return;

    if (role === 'client') {
      if (ticket.hasUnreadForClient) {
        ticket.hasUnreadForClient = false;
        await ticket.save();
      }
    } else {
      if (ticket.hasUnreadForAdmin) {
        ticket.hasUnreadForAdmin = false;
        await ticket.save();
      }
    }
  }

  private mapToDto(doc: any) {
    return {
      id: doc._id.toString(),
      clientId: doc.clientId,
      clientName: doc.clientName,
      department: doc.department,
      status: doc.status,
      messages: (doc.messages || []).map((m: any) => ({
        senderId: m.senderId,
        senderName: m.senderName,
        senderRole: m.senderRole,
        text: m.text,
        attachmentUrl: m.attachmentUrl,
        attachmentType: m.attachmentType,
        date: m.date instanceof Date ? m.date.toISOString() : m.date,
      })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
