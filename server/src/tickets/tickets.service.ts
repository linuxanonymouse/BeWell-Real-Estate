import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from './tickets.schema';

@Injectable()
export class TicketsService {
  constructor(@InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>) {}

  async create(clientId: string, clientName: string, department: string, text: string) {
    const ticket = await this.ticketModel.create({
      clientId,
      clientName,
      department,
      messages: [{
        senderId: clientId,
        senderName: clientName,
        senderRole: 'client',
        text,
        date: new Date(),
      }],
    });
    return this.mapToDto(ticket);
  }

  async addMessage(ticketId: string, senderId: string, senderName: string, senderRole: string, text: string) {
    const ticket = await this.ticketModel.findById(ticketId).exec();
    if (!ticket) return null;

    ticket.messages.push({
      senderId,
      senderName,
      senderRole,
      text,
      date: new Date(),
    } as any);

    await ticket.save();
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
        date: m.date instanceof Date ? m.date.toISOString() : m.date,
      })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
