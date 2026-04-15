import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/services/logger.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, firstName, lastName } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: '',
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User created: ${user.email}`, 'UsersService');

    return user;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              bio: true,
              avatarUrl: true,
              location: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        profile: {
          select: {
            bio: true,
            avatarUrl: true,
            phone: true,
            location: true,
            preferences: true,
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const { email, firstName, lastName, bio, avatarUrl, phone, location } =
      updateUserDto;

    if (email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const userData: any = {};
    if (email) userData.email = email.toLowerCase();
    if (firstName) userData.firstName = firstName;
    if (lastName) userData.lastName = lastName;

    const profileData: any = {};
    if (bio !== undefined) profileData.bio = bio;
    if (avatarUrl !== undefined) profileData.avatarUrl = avatarUrl;
    if (phone !== undefined) profileData.phone = phone;
    if (location !== undefined) profileData.location = location;

    const hasProfileData = Object.keys(profileData).length > 0;

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        ...(hasProfileData && {
          profile: {
            upsert: {
              create: profileData,
              update: profileData,
            },
          },
        }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            bio: true,
            avatarUrl: true,
            phone: true,
            location: true,
          },
        },
      },
    });

    this.logger.log(`User updated: ${user.email}`, 'UsersService');

    return user;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    this.logger.log(`User soft deleted: ${id}`, 'UsersService');

    return {
      message: 'User successfully deleted',
    };
  }

  async getUserStats(userId: string) {
    const user = await this.findOne(userId);

    const [interviewCount, completedInterviews, avgScore] = await Promise.all([
      this.prisma.interview.count({
        where: { userId },
      }),
      this.prisma.interview.count({
        where: {
          userId,
          status: 'COMPLETED',
        },
      }),
      this.prisma.interview.aggregate({
        where: {
          userId,
          status: 'COMPLETED',
          score: { not: null },
        },
        _avg: {
          score: true,
        },
      }),
    ]);

    return {
      user,
      stats: {
        totalInterviews: interviewCount,
        completedInterviews,
        averageScore: avgScore._avg.score || 0,
      },
    };
  }
}
