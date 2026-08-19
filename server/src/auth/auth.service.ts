import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
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
  }

  async register(name: string, email: string, password: string, phone?: string) {
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      name,
      email,
      password: hash,
      role: 'client',
      phone: phone || '',
    });
    return this.buildToken(user);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user && await bcrypt.compare(pass, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    return this.buildToken(user);
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      assignedProjectIds: user.assignedProjectIds,
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

  private buildToken(user: any) {
    const payload = { email: user.email, sub: user._id.toString(), role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
