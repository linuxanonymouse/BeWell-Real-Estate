import { Controller, Post, Body, Get, UnauthorizedException, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
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
}
