import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { mapUserProfile, userProfileInclude } from '../users/user-response';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: userProfileInclude,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // LOG LOGIN ACTIVITY
    await this.prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'USER',
        entityId: user.id,
        message: `${user.name} logged in`,
      },
    });

    return {
      access_token: accessToken,
      user: mapUserProfile(user),
    };
  }

  async logout(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // LOG LOGOUT ACTIVITY
    await this.prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGOUT',
        entity: 'USER',
        entityId: user.id,
        message: `${user.name} logged out`,
      },
    });

    return {
      message: 'Logged out successfully',
    };
  }
}
