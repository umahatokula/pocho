import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async generateTokens(userId: string, role: UserRole): Promise<AuthTokens> {
    const accessTtl = this.configService.get<number>('auth.accessTtl', 900);
    const refreshTtl = this.configService.get<number>('auth.refreshTtl', 604800);
    const refreshSecret = this.configService.get<string>('auth.refreshSecret', 'secret');

    const payload = { sub: userId, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: `${refreshTtl}s`,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTtl,
    };
  }

  async register(dto: RegisterDto) {
    const passwordHash = await argon2.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          phone: dto.phone,
          email: dto.email,
          passwordHash,
          role: dto.role,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      const tokens = await this.generateTokens(user.id, user.role);
      const { passwordHash: _, ...safeUser } = user;
      return {
        user: safeUser,
        tokens,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('User already exists');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.role);
    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      tokens,
    };
  }

  async refresh(dto: RefreshDto) {
    const refreshSecret = this.configService.get<string>('auth.refreshSecret', 'secret');
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; role: UserRole }>(
        dto.refreshToken,
        {
          secret: refreshSecret,
        },
      );

      const tokens = await this.generateTokens(payload.sub, payload.role);
      return { tokens };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
