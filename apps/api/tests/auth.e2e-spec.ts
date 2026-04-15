import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    if (process.env.NODE_ENV === 'test') {
      await prisma.cleanDatabase();
    }
  });

  describe('/api/v1/auth/register (POST)', () => {
    it('should successfully register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test1234!',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('refreshToken');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data.user.email).toBe('test@example.com');
        });
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test1234!',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should reject weak password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test1234!',
        firstName: 'Test',
        lastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);
    });
  });

  describe('/api/v1/auth/login (POST)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test1234!',
          firstName: 'Test',
          lastName: 'User',
        });
    });

    it('should successfully login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test1234!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('refreshToken');
          expect(res.body.data).toHaveProperty('user');
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should reject non-existent user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test1234!',
        })
        .expect(401);
    });
  });

  describe('/api/v1/auth/refresh (POST)', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test1234!',
          firstName: 'Test',
          lastName: 'User',
        });

      refreshToken = response.body.data.refreshToken;
    });

    it('should successfully refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('refreshToken');
          expect(res.body.data.refreshToken).not.toBe(refreshToken);
        });
    });

    it('should reject invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('/api/v1/auth/logout (POST)', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test1234!',
          firstName: 'Test',
          lastName: 'User',
        });

      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });

    it('should successfully logout', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);
    });

    it('should reject logout without auth token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({ refreshToken })
        .expect(401);
    });
  });
});
