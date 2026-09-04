import { Injectable, ConflictException, Inject, forwardRef, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { TelegramService } from '../telegram/telegram.service';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
    @Inject(forwardRef(() => ProjectsService))
    private projectsService: ProjectsService,
  ) {}

  async onModuleInit() {
    // Seed default admin if none exists
    const adminExists = await this.userModel.findOne({ role: 'superadmin' }).exec();
    if (!adminExists) {
      const hash = await bcrypt.hash('password123', 10);
      await this.userModel.create({
        name: 'Admin',
        email: 'admin@bewell.com',
        password: hash,
        role: 'superadmin',
      });
    }

    // Seed default support if none exists
    const supportExists = await this.userModel.findOne({ role: 'support' }).exec();
    if (!supportExists) {
      const hash = await bcrypt.hash('support123', 10);
      await this.userModel.create({
        name: 'Support Team',
        email: 'support@bewell.com',
        password: hash,
        role: 'support',
      });
    }
  }

  async register(name: string, email: string, password: string, phone?: string) {
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const hash = await bcrypt.hash(password, 10);
    // Generate a random 8-character token
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();

    const user = await this.userModel.create({
      name,
      email,
      password: hash,
      role: 'client',
      phone: phone || '',
      telegramLinkToken: token,
    });
    return this.buildToken(user);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user && await bcrypt.compare(pass, user.password)) {
      if ((user as any).banned) {
        throw new UnauthorizedException('Your account has been suspended.');
      }
      return user;
    }
    return null;
  }

  async login(user: any) {
    return this.buildToken(user);
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    if ((user as any).banned) throw new UnauthorizedException('Your account has been suspended.');
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      assignedProjectIds: user.assignedProjectIds,
      telegramLinkToken: user.telegramLinkToken,
      telegramLinked: user.telegramChatIds && user.telegramChatIds.length > 0,
    };
  }

  async getAllClients() {
    const clients = await this.userModel.find({ role: 'client' }).exec();
    return clients.map(c => ({
      id: c._id.toString(),
      name: c.name,
      email: c.email,
      phone: c.phone,
      assignedProjectIds: c.assignedProjectIds,
    }));
  }

  async assignProject(clientId: string, projectId: string) {
    const user = await this.userModel.findById(clientId).exec();
    if (!user) return null;
    if (!user.assignedProjectIds.includes(projectId)) {
      user.assignedProjectIds.push(projectId);
      await user.save();
      
      await this.projectsService.update(projectId, { ownerId: clientId });
      const project = await this.projectsService.findOne(projectId);
      if (project) {
        const worth = project.value ? project.value : 'TBD';
        const msg = `🎉 <b>You've been assigned to a new project!</b>\n\n` +
          `<b>${project.name}</b>\n` +
          `Location: ${project.location}\n` +
          `Estimated Value: ${worth}\n\n` +
          `You can view all the details and progress updates by logging into your dashboard!`;
        this.telegramService.notifyUser(clientId, msg);
      }
    }
    return { success: true };
  }

  async unassignProject(clientId: string, projectId: string) {
    const user = await this.userModel.findById(clientId).exec();
    if (!user) return null;
    user.assignedProjectIds = user.assignedProjectIds.filter(id => id !== projectId);
    await user.save();
    return { success: true };
  }

  async resetTelegramToken(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return null;
    
    // Create new token
    user.telegramLinkToken = Math.random().toString(36).substring(2, 10).toUpperCase();
    await user.save();
    
    // Notify admin securely (you might want to send this to the admin's Telegram, not the user's)
    this.telegramService.sendNotification(`⚠️ <b>Security Alert</b>\n\nUser ${user.name} (${user.email}) has reset their Telegram link token.`);
    
    return { 
      message: 'Token reset successful. Please use the new token to link your account.',
      token: user.telegramLinkToken
    };
  }

  async findUserByTokenForSimulation(token: string) {
    return this.userModel.findOne({ telegramLinkToken: token }).exec();
  }

  async getAllUsers() {
    const users = await this.userModel.find().exec();
    return users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      banned: (u as any).banned || false,
      assignedProjectIds: u.assignedProjectIds,
      telegramLinked: u.telegramChatIds && u.telegramChatIds.length > 0,
      createdAt: (u as any).createdAt,
    }));
  }

  async getStaffUsers() {
    const staff = await this.userModel.find({ role: { $in: ['superadmin', 'support'] } }).exec();
    return staff.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
    }));
  }

  async deleteUser(userId: string) {
    await this.userModel.findByIdAndDelete(userId).exec();
    return { deleted: true };
  }

  async banUser(userId: string, ban: boolean) {
    const user = await this.userModel.findByIdAndUpdate(userId, { banned: ban }, { new: true }).exec();
    if (!user) throw new Error('User not found');
    return { id: user._id.toString(), banned: (user as any).banned };
  }

  async updateUserPassword(userId: string, newPassword: string) {
    const hash = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(userId, { password: hash }).exec();
    return { success: true };
  }

  private buildToken(user: any) {
    const payload = { email: user.email, sub: user._id.toString(), role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        telegramLinked: user.telegramChatIds && user.telegramChatIds.length > 0,
      },
    };
  }
}
