import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { PasswordUtil } from '../../common/utils/password.util';
import { LoggerService } from '../../common/services/logger.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, firstName, lastName } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordValidation = PasswordUtil.validate(password);
    if (!passwordValidation.valid) {
      throw new BadRequestException(passwordValidation.errors[0]);
    }

    const hashedPassword = await PasswordUtil.hash(password);

    const user = await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
    });

    this.logger.log(`User registered: ${user.email}`, 'AuthService');

    return {
      ...tokens,
      user,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordValid = await PasswordUtil.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
    });

    this.logger.log(`User logged in: ${user.email}`, 'AuthService');

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              isActive: true,
            },
          },
        },
      });

      if (!storedToken || storedToken.revokedAt) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (new Date() > storedToken.expiresAt) {
        throw new UnauthorizedException('Refresh token expired');
      }

      if (!storedToken.user.isActive) {
        throw new UnauthorizedException('Account is inactive');
      }

      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      const tokens = await this.generateTokens({
        userId: payload.userId,
        email: payload.email,
      });

      return {
        ...tokens,
        user: storedToken.user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revokedAt: new Date() },
      });
    } catch (error) {
      this.logger.error('Error revoking refresh token', error, 'AuthService');
    }
  }

  async validateUser(payload: TokenPayload): Promise<TokenPayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      userId: user.id,
      email: user.email,
    };
  }

  private async generateTokens(payload: TokenPayload): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    const expiresIn = this.configService.get<string>('jwt.refreshExpiresIn');
    const expiresAt = this.calculateExpirationDate(expiresIn);

    await this.prisma.refreshToken.create({
      data: {
        userId: payload.userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private calculateExpirationDate(expiresIn: string): Date {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const [, value, unit] = match;
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + parseInt(value, 10) * multipliers[unit]);
  }
}
