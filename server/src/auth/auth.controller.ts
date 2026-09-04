import { Controller, Post, Body, Get, Put, Delete, Param, UnauthorizedException, HttpCode, HttpStatus, UseGuards, Request, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: { name: string; email: string; password: string; phone?: string }) {
    return this.authService.register(body.name, body.email, body.password, body.phone);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('clients')
  async getClients(@Request() req: any) {
    if (req.user.role !== 'superadmin') {
      throw new UnauthorizedException('Admin only');
    }
    return this.authService.getAllClients();
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getAllUsers(@Request() req: any) {
    if (req.user.role !== 'superadmin' && req.user.role !== 'support') {
      throw new UnauthorizedException('Admin only');
    }
    return this.authService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('staff')
  async getStaff() {
    return this.authService.getStaffUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  async deleteUser(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'superadmin') throw new UnauthorizedException('Superadmin only');
    return this.authService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/:id/ban')
  async banUser(@Request() req: any, @Param('id') id: string, @Body() body: { banned: boolean }) {
    if (req.user.role !== 'superadmin' && req.user.role !== 'support') throw new UnauthorizedException('Admin and Support only');
    return this.authService.banUser(id, body.banned);
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/:id/password')
  async updatePassword(@Request() req: any, @Param('id') id: string, @Body() body: { password: string }) {
    if (req.user.role !== 'superadmin' && req.user.userId !== id) {
      throw new UnauthorizedException('You can only update your own password');
    }
    return this.authService.updateUserPassword(id, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('assign-project')
  async assignProject(@Request() req: any, @Body() body: { clientId: string; projectId: string }) {
    if (req.user.role !== 'superadmin') {
      throw new UnauthorizedException('Admin only');
    }
    return this.authService.assignProject(body.clientId, body.projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unassign-project')
  async unassignProject(@Request() req: any, @Body() body: { clientId: string; projectId: string }) {
    if (req.user.role !== 'superadmin') {
      throw new UnauthorizedException('Admin only');
    }
    return this.authService.unassignProject(body.clientId, body.projectId);
  }
  @UseGuards(JwtAuthGuard)
  @Post('reset-telegram')
  async resetTelegram(@Request() req: any) {
    return this.authService.resetTelegramToken(req.user.userId);
  }

  @Get('simulate-telegram')
  async simulateTelegramLink(@Query('token') token: string, @Query('chatId') chatId: string) {
    const user = await this.authService.findUserByTokenForSimulation(token);
    if (!user) return { success: false, message: 'Invalid token' };
    user.telegramChatIds = user.telegramChatIds || [];
    user.telegramChatIds.push(chatId);
    await user.save();
    return { success: true, user };
  }
}
