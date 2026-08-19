import { Controller, Get, Post, Param, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // Client creates a new ticket
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() body: { department: string; text: string }) {
    return this.ticketsService.create(
      req.user.userId,
      req.user.email, // Will use name from profile in frontend
      body.department,
      body.text,
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
    if (req.user.role !== 'superadmin') {
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
    return ticket;
  }

  // Add message to ticket
  @UseGuards(JwtAuthGuard)
  @Post(':id/message')
  async addMessage(@Request() req: any, @Param('id') id: string, @Body() body: { text: string }) {
    // Verify access
    const ticket = await this.ticketsService.findOne(id);
    if (!ticket) return null;
    if (req.user.role === 'client' && ticket.clientId !== req.user.userId) {
      throw new UnauthorizedException();
    }
    return this.ticketsService.addMessage(id, req.user.userId, req.user.email, req.user.role, body.text);
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
