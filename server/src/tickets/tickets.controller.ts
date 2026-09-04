import { Controller, Get, Post, Param, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // Get unread count
  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    return { count: await this.ticketsService.getUnreadCount(req.user.userId, req.user.role) };
  }

  // Client creates a new ticket
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() body: { department: string; text: string; attachmentUrl?: string; attachmentType?: string }) {
    return this.ticketsService.create(
      req.user.userId,
      req.user.email, // Will use name from profile in frontend
      body.department,
      body.text,
      body.attachmentUrl,
      body.attachmentType
    );
  }

  // Admin creates a new ticket for a client
  @UseGuards(JwtAuthGuard)
  @Post('admin')
  async createForClient(@Request() req: any, @Body() body: { clientId: string; clientName: string; department: string; text: string; attachmentUrl?: string; attachmentType?: string }) {
    if (req.user.role !== 'superadmin' && req.user.role !== 'support') {
      throw new UnauthorizedException();
    }
    return this.ticketsService.adminCreate(
      body.clientId,
      body.clientName,
      body.department,
      body.text,
      req.user.userId,
      req.user.email,
      req.user.role,
      body.attachmentUrl,
      body.attachmentType
    );
  }

  // Client gets their tickets
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyTickets(@Request() req: any) {
    return this.ticketsService.findByClient(req.user.userId);
  }

  // Admin/Support gets tickets by department
  @UseGuards(JwtAuthGuard)
  @Get('department/:dept')
  async getByDepartment(@Request() req: any, @Param('dept') dept: string) {
    if (req.user.role !== 'superadmin' && req.user.role !== 'support') {
      throw new UnauthorizedException();
    }
    return this.ticketsService.findByDepartment(dept);
  }

  // Admin gets all tickets
  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAll(@Request() req: any) {
    if (req.user.role !== 'superadmin' && req.user.role !== 'support') {
      throw new UnauthorizedException();
    }
    return this.ticketsService.findAll();
  }

  // Get single ticket
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Request() req: any, @Param('id') id: string) {
    const ticket = await this.ticketsService.findOne(id);
    if (!ticket) return null;
    // Clients can only view their own tickets
    if (req.user.role === 'client' && ticket.clientId !== req.user.userId) {
      throw new UnauthorizedException();
    }
    // Mark as read when fetching a specific ticket
    await this.ticketsService.markAsRead(id, req.user.role);
    return ticket;
  }

  // Mark as read
  @UseGuards(JwtAuthGuard)
  @Post(':id/read')
  async markRead(@Request() req: any, @Param('id') id: string) {
    const ticket = await this.ticketsService.findOne(id);
    if (!ticket) return null;
    if (req.user.role === 'client' && ticket.clientId !== req.user.userId) {
      throw new UnauthorizedException();
    }
    await this.ticketsService.markAsRead(id, req.user.role);
    return { success: true };
  }

  // Add message to ticket
  @UseGuards(JwtAuthGuard)
  @Post(':id/message')
  async addMessage(@Request() req: any, @Param('id') id: string, @Body() body: { text: string; attachmentUrl?: string; attachmentType?: string }) {
    // Verify access
    const ticket = await this.ticketsService.findOne(id);
    if (!ticket) return null;
    if (req.user.role === 'client' && ticket.clientId !== req.user.userId) {
      throw new UnauthorizedException();
    }
    return this.ticketsService.addMessage(id, req.user.userId, req.user.email, req.user.role, body.text, body.attachmentUrl, body.attachmentType);
  }

  // Close ticket
  @UseGuards(JwtAuthGuard)
  @Post(':id/close')
  async closeTicket(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'superadmin' && req.user.role !== 'support') {
      throw new UnauthorizedException();
    }
    return this.ticketsService.closeTicket(id);
  }
}
