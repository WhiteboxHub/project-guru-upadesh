import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { QuestionCategory, DifficultyLevel } from '../src/dto/generate-question.dto';

describe('AI Service (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/ai/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/ai/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('service', 'ai-service');
          expect(res.body).toHaveProperty('ai');
          expect(res.body).toHaveProperty('cache');
          expect(res.body).toHaveProperty('tokens');
        });
    });
  });

  describe('/api/v1/ai/generate-question (POST)', () => {
    it('should generate a question with valid input', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/generate-question')
        .send({
          category: QuestionCategory.BEHAVIORAL,
          difficulty: DifficultyLevel.MEDIUM,
          company: 'Google',
          role: 'Software Engineer',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('question');
          expect(res.body).toHaveProperty('category');
          expect(res.body).toHaveProperty('difficulty');
          expect(res.body).toHaveProperty('evaluationCriteria');
          expect(res.body).toHaveProperty('suggestedTimeSeconds');
        });
    });

    it('should reject invalid category', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/generate-question')
        .send({
          category: 'INVALID_CATEGORY',
          difficulty: DifficultyLevel.MEDIUM,
        })
        .expect(400);
    });

    it('should reject missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/generate-question')
        .send({
          category: QuestionCategory.BEHAVIORAL,
        })
        .expect(400);
    });
  });

  describe('/api/v1/ai/evaluate-answer (POST)', () => {
    it('should evaluate an answer with valid input', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/evaluate-answer')
        .send({
          question: 'Tell me about a time when you faced a difficult challenge.',
          answer:
            'In my previous role, I encountered a critical production issue that affected thousands of users...',
          category: QuestionCategory.BEHAVIORAL,
          context: {
            role: 'Senior Developer',
            yearsOfExperience: 5,
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('score');
          expect(res.body).toHaveProperty('grade');
          expect(res.body).toHaveProperty('feedback');
          expect(res.body).toHaveProperty('scoreBreakdown');
          expect(res.body.score).toBeGreaterThanOrEqual(0);
          expect(res.body.score).toBeLessThanOrEqual(100);
        });
    });

    it('should reject answer that is too short', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/evaluate-answer')
        .send({
          question: 'Tell me about yourself.',
          answer: 'I am good.',
          category: QuestionCategory.BEHAVIORAL,
        })
        .expect(400);
    });
  });

  describe('/api/v1/ai/generate-followup (POST)', () => {
    it('should generate a follow-up question', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/generate-followup')
        .send({
          question: 'Tell me about a challenging project.',
          answer:
            'I worked on a microservices architecture that required coordinating multiple teams...',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('followUpQuestion');
          expect(typeof res.body.followUpQuestion).toBe('string');
          expect(res.body.followUpQuestion.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/api/v1/ai/analyze-resume (POST)', () => {
    it('should analyze a resume with valid input', () => {
      const resumeText = `
John Doe
Senior Software Engineer

Experience:
- Senior Software Engineer at Tech Corp (2020-2023)
  - Led development of microservices architecture
  - Improved system performance by 40%
  - Mentored team of 5 junior developers

- Software Engineer at StartupXYZ (2018-2020)
  - Developed full-stack web applications
  - Implemented CI/CD pipelines

Skills: JavaScript, TypeScript, React, Node.js, AWS, Docker
      `;

      return request(app.getHttpServer())
        .post('/api/v1/ai/analyze-resume')
        .send({
          resumeText,
          targetIndustry: 'Technology',
          targetRole: 'Senior Software Engineer',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('atsScore');
          expect(res.body).toHaveProperty('overallScore');
          expect(res.body).toHaveProperty('summary');
          expect(res.body).toHaveProperty('keywords');
          expect(res.body).toHaveProperty('formatting');
          expect(res.body).toHaveProperty('content');
          expect(res.body).toHaveProperty('impact');
        });
    });

    it('should reject resume that is too short', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/analyze-resume')
        .send({
          resumeText: 'John Doe',
        })
        .expect(400);
    });

    it('should reject resume that is too long', () => {
      const longResume = 'A'.repeat(60000);
      return request(app.getHttpServer())
        .post('/api/v1/ai/analyze-resume')
        .send({
          resumeText: longResume,
        })
        .expect(400);
    });
  });

  describe('/api/v1/ai/generate-feedback (POST)', () => {
    it('should generate comprehensive interview feedback', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/generate-feedback')
        .send({
          interviewData: [
            {
              question: 'Tell me about yourself.',
              answer: 'I am a software engineer with 5 years of experience...',
              category: 'behavioral',
              score: 85,
            },
            {
              question: 'What is your greatest strength?',
              answer: 'My greatest strength is problem-solving...',
              category: 'behavioral',
              score: 78,
            },
          ],
          overallScore: 82,
          targetRole: 'Software Engineer',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('summary');
          expect(res.body).toHaveProperty('strengths');
          expect(res.body).toHaveProperty('areasForImprovement');
          expect(res.body).toHaveProperty('recommendations');
          expect(res.body).toHaveProperty('categoryBreakdown');
          expect(res.body).toHaveProperty('nextSteps');
        });
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(110).fill(null);

      const results = await Promise.allSettled(
        requests.map(() =>
          request(app.getHttpServer())
            .post('/api/v1/ai/generate-question')
            .send({
              category: QuestionCategory.BEHAVIORAL,
              difficulty: DifficultyLevel.EASY,
            }),
        ),
      );

      const rateLimited = results.some(
        (result) => result.status === 'fulfilled' && result.value.status === 429,
      );

      expect(rateLimited).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/generate-question')
        .send({
          invalidField: 'value',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', false);
          expect(res.body).toHaveProperty('error');
        });
    });

    it('should return proper error format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/evaluate-answer')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error).toHaveProperty('code');
          expect(res.body.error).toHaveProperty('message');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('path');
        });
    });
  });

  describe('/api/v1/ai/stats (GET)', () => {
    it('should return service statistics', () => {
      return request(app.getHttpServer())
        .get('/api/v1/ai/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('tokenUsage');
          expect(res.body).toHaveProperty('cacheStats');
        });
    });
  });
});
