import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/services/logger.service';
import { PasswordUtil } from '../../common/utils/password.util';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        'jwt.secret': 'test-secret',
        'jwt.expiresIn': '15m',
        'jwt.refreshSecret': 'test-refresh-secret',
        'jwt.refreshExpiresIn': '7d',
      };
      return config[key];
    }),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'SecurePass123!',
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should successfully register a new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'new-user-123',
        email: registerDto.email.toLowerCase(),
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      jest.spyOn(PasswordUtil, 'validate').mockReturnValue({
        valid: true,
        errors: [],
      });
      jest.spyOn(PasswordUtil, 'hash').mockResolvedValue('hashedPassword');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email.toLowerCase());
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email.toLowerCase() },
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      jest.spyOn(PasswordUtil, 'validate').mockReturnValue({
        valid: false,
        errors: ['Password must contain at least one uppercase letter'],
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should convert email to lowercase', async () => {
      const dtoWithUpperEmail = {
        ...registerDto,
        email: 'NewUser@EXAMPLE.COM',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'new-user-123',
        email: dtoWithUpperEmail.email.toLowerCase(),
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      jest.spyOn(PasswordUtil, 'validate').mockReturnValue({
        valid: true,
        errors: [],
      });
      jest.spyOn(PasswordUtil, 'hash').mockResolvedValue('hashedPassword');

      await service.register(dtoWithUpperEmail);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: dtoWithUpperEmail.email.toLowerCase() },
      });
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    it('should successfully login user with valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(PasswordUtil, 'compare').mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(PasswordUtil, 'compare').mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should convert email to lowercase', async () => {
      const dtoWithUpperEmail = {
        ...loginDto,
        email: 'TEST@EXAMPLE.COM',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(PasswordUtil, 'compare').mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      await service.login(dtoWithUpperEmail);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: dtoWithUpperEmail.email.toLowerCase() },
        select: expect.any(Object),
      });
    });
  });

  describe('refreshToken', () => {
    const refreshToken = 'valid-refresh-token';
    const tokenPayload = {
      userId: 'user-123',
      email: 'test@example.com',
    };

    it('should successfully refresh token with valid refresh token', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      mockJwtService.verify.mockReturnValue(tokenPayload);
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'token-123',
        token: refreshToken,
        userId: tokenPayload.userId,
        expiresAt: futureDate,
        revokedAt: null,
        user: {
          id: tokenPayload.userId,
          email: tokenPayload.email,
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
        },
      });
      mockPrismaService.refreshToken.update.mockResolvedValue({});
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.refreshToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(mockPrismaService.refreshToken.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for revoked token', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      mockJwtService.verify.mockReturnValue(tokenPayload);
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'token-123',
        token: refreshToken,
        userId: tokenPayload.userId,
        expiresAt: futureDate,
        revokedAt: new Date(),
        user: mockUser,
      });

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const pastDate = new Date(Date.now() - 1000);
      mockJwtService.verify.mockReturnValue(tokenPayload);
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'token-123',
        token: refreshToken,
        userId: tokenPayload.userId,
        expiresAt: pastDate,
        revokedAt: null,
        user: mockUser,
      });

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      mockJwtService.verify.mockReturnValue(tokenPayload);
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'token-123',
        token: refreshToken,
        userId: tokenPayload.userId,
        expiresAt: futureDate,
        revokedAt: null,
        user: {
          ...mockUser,
          isActive: false,
        },
      });

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should successfully revoke refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({
        count: 1,
      });

      await service.logout(refreshToken);

      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { token: refreshToken },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('should handle errors gracefully', async () => {
      const refreshToken = 'valid-refresh-token';
      mockPrismaService.refreshToken.updateMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.logout(refreshToken)).resolves.toBeUndefined();
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    const payload = {
      userId: 'user-123',
      email: 'test@example.com',
    };

    it('should successfully validate active user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: payload.userId,
        email: payload.email,
        isActive: true,
      });

      const result = await service.validateUser(payload);

      expect(result).toEqual(payload);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: payload.userId,
        email: payload.email,
        isActive: false,
      });

      await expect(service.validateUser(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
