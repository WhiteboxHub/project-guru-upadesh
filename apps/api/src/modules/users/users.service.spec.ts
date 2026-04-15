import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/services/logger.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    interview: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
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
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto = {
      email: 'newuser@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should successfully create a new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'new-user-123',
        email: createUserDto.email.toLowerCase(),
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email.toLowerCase());
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email.toLowerCase() },
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should convert email to lowercase', async () => {
      const dtoWithUpperEmail = {
        ...createUserDto,
        email: 'NEWUSER@EXAMPLE.COM',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'new-user-123',
        email: dtoWithUpperEmail.email.toLowerCase(),
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.create(dtoWithUpperEmail);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: dtoWithUpperEmail.email.toLowerCase() },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [mockUser];
      const total = 1;

      mockPrismaService.user.findMany.mockResolvedValue(users);
      mockPrismaService.user.count.mockResolvedValue(total);

      const result = await service.findAll(1, 10);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toEqual(users);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should calculate pagination correctly', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(25);

      const result = await service.findAll(2, 10);

      expect(result.meta).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return user by ID', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('user-123');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user is deleted', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      await expect(service.findOne('user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should convert email to lowercase', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await service.findByEmail('TEST@EXAMPLE.COM');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    const updateUserDto = {
      firstName: 'Jane',
      bio: 'Updated bio',
    };

    it('should successfully update user', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateUserDto,
      });

      const result = await service.update('user-123', updateUserDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      const dtoWithEmail = {
        email: 'another@example.com',
      };
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({
          ...mockUser,
          id: 'different-id',
          email: 'another@example.com',
        });

      await expect(service.update('user-123', dtoWithEmail)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      const result = await service.remove('user-123');

      expect(result).toHaveProperty('message');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.interview.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(7);
      mockPrismaService.interview.aggregate.mockResolvedValue({
        _avg: {
          score: 85.5,
        },
      });

      const result = await service.getUserStats('user-123');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('stats');
      expect(result.stats.totalInterviews).toBe(10);
      expect(result.stats.completedInterviews).toBe(7);
      expect(result.stats.averageScore).toBe(85.5);
    });

    it('should return 0 for average score if no completed interviews', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.interview.count.mockResolvedValue(0);
      mockPrismaService.interview.aggregate.mockResolvedValue({
        _avg: {
          score: null,
        },
      });

      const result = await service.getUserStats('user-123');

      expect(result.stats.averageScore).toBe(0);
    });
  });
});
