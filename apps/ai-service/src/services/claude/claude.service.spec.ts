import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ClaudeService } from './claude.service';
import { PromptBuilderService } from './prompt-builder.service';
import { ResponseParserService } from './response-parser.service';
import { CacheService } from '@utils/cache.service';
import { TokenCounterService } from '@utils/token-counter.service';
import { CircuitBreakerService } from '@utils/circuit-breaker.service';
import { QuestionCategory, DifficultyLevel } from '@dto/generate-question.dto';

describe('ClaudeService', () => {
  let service: ClaudeService;
  let cacheService: CacheService;
  let circuitBreaker: CircuitBreakerService;
  let promptBuilder: PromptBuilderService;
  let responseParser: ResponseParserService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        'ai.anthropicApiKey': 'test-api-key',
        'ai.model': 'claude-3-5-sonnet-20241022',
        'ai.maxTokens': 4096,
        'ai.temperature': 0.7,
        'ai.timeout': 30000,
        'ai.retryAttempts': 3,
        'ai.retryDelay': 1000,
      };
      return config[key] || defaultValue;
    }),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    getStats: jest.fn().mockResolvedValue({
      enabled: true,
      connected: true,
      keyCount: 0,
    }),
  };

  const mockTokenCounter = {
    trackUsage: jest.fn(),
    getStats: jest.fn().mockResolvedValue({
      totalOperations: 0,
      totalTokens: 0,
      estimatedTotalCost: 0,
    }),
  };

  const mockCircuitBreaker = {
    execute: jest.fn((fn) => fn()),
    getState: jest.fn().mockReturnValue('CLOSED'),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaudeService,
        PromptBuilderService,
        ResponseParserService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: TokenCounterService,
          useValue: mockTokenCounter,
        },
        {
          provide: CircuitBreakerService,
          useValue: mockCircuitBreaker,
        },
      ],
    }).compile();

    service = module.get<ClaudeService>(ClaudeService);
    cacheService = module.get<CacheService>(CacheService);
    circuitBreaker = module.get<CircuitBreakerService>(CircuitBreakerService);
    promptBuilder = module.get<PromptBuilderService>(PromptBuilderService);
    responseParser = module.get<ResponseParserService>(ResponseParserService);

    // Initialize the service
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with configuration', () => {
      expect(mockConfigService.get).toHaveBeenCalledWith('ai.anthropicApiKey');
      expect(mockConfigService.get).toHaveBeenCalledWith(
        'ai.model',
        'claude-3-5-sonnet-20241022',
      );
    });

    it('should throw error if API key is not configured', () => {
      const invalidConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      };

      const createInvalidService = async () => {
        const module = await Test.createTestingModule({
          providers: [
            ClaudeService,
            PromptBuilderService,
            ResponseParserService,
            {
              provide: ConfigService,
              useValue: invalidConfigService,
            },
            {
              provide: CacheService,
              useValue: mockCacheService,
            },
            {
              provide: TokenCounterService,
              useValue: mockTokenCounter,
            },
            {
              provide: CircuitBreakerService,
              useValue: mockCircuitBreaker,
            },
          ],
        }).compile();

        const invalidService = module.get<ClaudeService>(ClaudeService);
        invalidService.onModuleInit();
      };

      expect(createInvalidService()).rejects.toThrow(
        'ANTHROPIC_API_KEY is not configured',
      );
    });
  });

  describe('generateInterviewQuestion', () => {
    const mockQuestionDto = {
      category: QuestionCategory.BEHAVIORAL,
      difficulty: DifficultyLevel.MEDIUM,
      company: 'Google',
      role: 'Software Engineer',
    };

    const mockParsedQuestion = {
      question: 'Tell me about a time when you faced a difficult challenge.',
      evaluationCriteria: ['STAR method', 'Specificity', 'Outcome'],
      suggestedTimeSeconds: 180,
      hints: ['Use specific examples', 'Focus on your actions'],
    };

    it('should return cached question if available', async () => {
      const cachedQuestion = {
        ...mockParsedQuestion,
        category: QuestionCategory.BEHAVIORAL,
        difficulty: DifficultyLevel.MEDIUM,
      };

      mockCacheService.get.mockResolvedValue(cachedQuestion);

      const result = await service.generateInterviewQuestion(mockQuestionDto);

      expect(result).toEqual(cachedQuestion);
      expect(mockCacheService.get).toHaveBeenCalled();
      expect(mockCircuitBreaker.execute).not.toHaveBeenCalled();
    });

    it('should generate new question if not cached', async () => {
      mockCacheService.get.mockResolvedValue(null);

      // Mock the Claude API call
      const claudeResponse = JSON.stringify(mockParsedQuestion);
      jest
        .spyOn(service as any, 'callClaude')
        .mockResolvedValue(claudeResponse);

      const result = await service.generateInterviewQuestion(mockQuestionDto);

      expect(result.question).toBe(mockParsedQuestion.question);
      expect(result.category).toBe(QuestionCategory.BEHAVIORAL);
      expect(result.difficulty).toBe(DifficultyLevel.MEDIUM);
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('should handle circuit breaker', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockCircuitBreaker.execute.mockRejectedValue(
        new Error('Circuit breaker open'),
      );

      await expect(
        service.generateInterviewQuestion(mockQuestionDto),
      ).rejects.toThrow();
    });
  });

  describe('evaluateAnswer', () => {
    const mockEvaluationDto = {
      question: 'Tell me about a challenging project.',
      answer: 'I worked on a complex system that required...',
      category: QuestionCategory.BEHAVIORAL,
      context: {
        role: 'Software Engineer',
        yearsOfExperience: 5,
      },
    };

    const mockEvaluation = {
      score: 85,
      grade: 'B+',
      feedback: {
        strengths: ['Clear structure', 'Good examples'],
        weaknesses: ['Could be more specific'],
        suggestions: ['Add more metrics'],
      },
      scoreBreakdown: {
        relevance: { score: 90, comment: 'Very relevant' },
        completeness: { score: 80, comment: 'Good detail' },
        clarity: { score: 85, comment: 'Clear communication' },
        specificity: { score: 80, comment: 'Could be more specific' },
        professionalism: { score: 90, comment: 'Professional tone' },
      },
    };

    it('should evaluate answer successfully', async () => {
      const claudeResponse = JSON.stringify(mockEvaluation);
      jest
        .spyOn(service as any, 'callClaude')
        .mockResolvedValue(claudeResponse);

      const result = await service.evaluateAnswer(mockEvaluationDto);

      expect(result.score).toBe(mockEvaluation.score);
      expect(result.grade).toBe(mockEvaluation.grade);
      expect(result.feedback).toBeDefined();
      expect(mockTokenCounter.trackUsage).toHaveBeenCalledWith(
        'evaluate_answer',
        expect.any(String),
        expect.any(String),
      );
    });

    it('should use lower temperature for evaluation', async () => {
      const callClaudeSpy = jest
        .spyOn(service as any, 'callClaude')
        .mockResolvedValue(JSON.stringify(mockEvaluation));

      await service.evaluateAnswer(mockEvaluationDto);

      expect(callClaudeSpy).toHaveBeenCalledWith(expect.any(String), 0.3);
    });

    it('should handle evaluation errors', async () => {
      jest
        .spyOn(service as any, 'callClaude')
        .mockRejectedValue(new Error('API error'));

      await expect(service.evaluateAnswer(mockEvaluationDto)).rejects.toThrow();
    });
  });

  describe('generateFollowUp', () => {
    const question = 'Tell me about a challenging project.';
    const answer = 'I worked on a complex microservices architecture...';
    const followUp = 'Can you describe how you handled service communication?';

    it('should return cached follow-up if available', async () => {
      mockCacheService.get.mockResolvedValue(followUp);

      const result = await service.generateFollowUp(question, answer);

      expect(result).toBe(followUp);
      expect(mockCacheService.get).toHaveBeenCalled();
    });

    it('should generate new follow-up if not cached', async () => {
      mockCacheService.get.mockResolvedValue(null);
      jest.spyOn(service as any, 'callClaude').mockResolvedValue(followUp);

      const result = await service.generateFollowUp(question, answer);

      expect(result).toBe(followUp);
      expect(mockCacheService.set).toHaveBeenCalled();
    });
  });

  describe('analyzeResume', () => {
    const mockResumeDto = {
      resumeText: 'John Doe\nSoftware Engineer\n\nExperience: ...',
      jobDescription: 'Looking for a senior software engineer...',
      targetIndustry: 'Technology',
      targetRole: 'Senior Software Engineer',
    };

    const mockAnalysis = {
      atsScore: 78,
      overallScore: 82,
      summary: {
        strengths: ['Clear formatting', 'Good experience'],
        weaknesses: ['Missing keywords', 'Needs more metrics'],
        missingElements: ['Cover letter'],
      },
      keywords: {
        present: ['JavaScript', 'React', 'Node.js'],
        missing: ['TypeScript', 'AWS'],
        suggestions: ['Add cloud technologies', 'Include frameworks'],
      },
      formatting: {
        score: 85,
        issues: ['Inconsistent spacing'],
        recommendations: ['Use consistent formatting'],
      },
      content: {
        score: 80,
        feedback: ['Good descriptions'],
        improvements: ['Add more metrics'],
      },
      impact: {
        quantifiedAchievements: 5,
        actionVerbUsage: 75,
        suggestions: ['Use more action verbs'],
      },
    };

    it('should analyze resume successfully', async () => {
      const claudeResponse = JSON.stringify(mockAnalysis);
      jest
        .spyOn(service as any, 'callClaude')
        .mockResolvedValue(claudeResponse);

      const result = await service.analyzeResume(mockResumeDto);

      expect(result.atsScore).toBe(mockAnalysis.atsScore);
      expect(result.overallScore).toBe(mockAnalysis.overallScore);
      expect(mockTokenCounter.trackUsage).toHaveBeenCalled();
    });

    it('should use higher token limit for resume analysis', async () => {
      const callClaudeSpy = jest
        .spyOn(service as any, 'callClaude')
        .mockResolvedValue(JSON.stringify(mockAnalysis));

      await service.analyzeResume(mockResumeDto);

      expect(callClaudeSpy).toHaveBeenCalledWith(
        expect.any(String),
        0.5,
        8192,
      );
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const health = await service.healthCheck();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('model');
      expect(health).toHaveProperty('circuitBreakerState');
      expect(health.circuitBreakerState).toBe('CLOSED');
    });

    it('should report degraded status when circuit is open', async () => {
      mockCircuitBreaker.getState.mockReturnValue('OPEN');

      const health = await service.healthCheck();

      expect(health.status).toBe('degraded');
    });
  });

  describe('retry logic', () => {
    it('should retry on failure', async () => {
      mockCacheService.get.mockResolvedValue(null);

      const callClaudeSpy = jest
        .spyOn(service as any, 'callClaude')
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce(
          JSON.stringify({
            question: 'Test question',
            evaluationCriteria: [],
            suggestedTimeSeconds: 180,
          }),
        );

      const result = await service.generateInterviewQuestion({
        category: QuestionCategory.BEHAVIORAL,
        difficulty: DifficultyLevel.MEDIUM,
      });

      expect(result).toBeDefined();
      expect(callClaudeSpy).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retry attempts', async () => {
      mockCacheService.get.mockResolvedValue(null);

      jest
        .spyOn(service as any, 'callClaude')
        .mockRejectedValue(new Error('Persistent failure'));

      await expect(
        service.generateInterviewQuestion({
          category: QuestionCategory.BEHAVIORAL,
          difficulty: DifficultyLevel.MEDIUM,
        }),
      ).rejects.toThrow();
    });
  });
});
