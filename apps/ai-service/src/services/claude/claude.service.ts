import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PromptBuilderService } from './prompt-builder.service';
import { ResponseParserService } from './response-parser.service';
import { CacheService } from '@utils/cache.service';
import { TokenCounterService } from '@utils/token-counter.service';
import { CircuitBreakerService } from '@utils/circuit-breaker.service';
import {
  GenerateQuestionDto,
  GeneratedQuestionResponseDto,
  QuestionCategory,
  DifficultyLevel,
} from '@dto/generate-question.dto';
import { EvaluateAnswerDto, AnswerEvaluationResponseDto } from '@dto/evaluate-answer.dto';
import { AnalyzeResumeDto, ResumeAnalysisResponseDto } from '@dto/analyze-resume.dto';
import { GenerateFeedbackDto, InterviewFeedbackResponseDto } from '@dto/generate-feedback.dto';

@Injectable()
export class ClaudeService implements OnModuleInit {
  private readonly logger = new Logger(ClaudeService.name);
  private anthropic: Anthropic;
  private model: string;
  private maxTokens: number;
  private temperature: number;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly responseParser: ResponseParserService,
    private readonly cacheService: CacheService,
    private readonly tokenCounter: TokenCounterService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  onModuleInit(): void {
    const apiKey = this.configService.get<string>('ai.anthropicApiKey');
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    this.anthropic = new Anthropic({
      apiKey,
    });

    this.model = this.configService.get<string>('ai.model', 'claude-3-5-sonnet-20241022');
    this.maxTokens = this.configService.get<number>('ai.maxTokens', 4096);
    this.temperature = this.configService.get<number>('ai.temperature', 0.7);
    this.timeout = this.configService.get<number>('ai.timeout', 30000);
    this.retryAttempts = this.configService.get<number>('ai.retryAttempts', 3);
    this.retryDelay = this.configService.get<number>('ai.retryDelay', 1000);

    this.logger.log(`Claude service initialized with model: ${this.model}`);
  }

  /**
   * Generate an interview question based on category and difficulty
   */
  async generateInterviewQuestion(dto: GenerateQuestionDto): Promise<GeneratedQuestionResponseDto> {
    const cacheKey = this.generateCacheKey('question', dto);
    const cached = await this.cacheService.get<GeneratedQuestionResponseDto>(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for question generation: ${cacheKey}`);
      return cached;
    }

    const prompt = this.promptBuilder.buildInterviewQuestionPrompt(dto.category, dto.difficulty, {
      company: dto.company,
      role: dto.role,
      industry: dto.industry,
      yearsOfExperience: dto.yearsOfExperience,
    });

    const response = await this.executeWithRetry(async () => {
      return await this.circuitBreaker.execute(async () => {
        return await this.callClaude(prompt, 0.7);
      });
    });

    const parsedQuestion = this.responseParser.parseGeneratedQuestion(response);
    const result: GeneratedQuestionResponseDto = {
      question: parsedQuestion.question || '',
      category: dto.category,
      difficulty: dto.difficulty,
      suggestedTimeSeconds: parsedQuestion.suggestedTimeSeconds || 180,
      evaluationCriteria: parsedQuestion.evaluationCriteria || [],
      hints: parsedQuestion.hints,
    };

    // Cache for 1 hour
    await this.cacheService.set(cacheKey, result, 3600);

    return result;
  }

  /**
   * Evaluate a candidate's answer to an interview question
   */
  async evaluateAnswer(dto: EvaluateAnswerDto): Promise<AnswerEvaluationResponseDto> {
    // Don't cache evaluations as they should be unique
    const prompt = this.promptBuilder.buildAnswerEvaluationPrompt(
      dto.question,
      dto.answer,
      dto.category,
      dto.context,
    );

    const response = await this.executeWithRetry(async () => {
      return await this.circuitBreaker.execute(async () => {
        return await this.callClaude(prompt, 0.3); // Lower temperature for consistent evaluation
      });
    });

    const evaluation = this.responseParser.parseAnswerEvaluation(response);

    // Track token usage
    await this.tokenCounter.trackUsage('evaluate_answer', prompt, response);

    return evaluation;
  }

  /**
   * Generate a follow-up question based on the previous exchange
   */
  async generateFollowUp(question: string, answer: string): Promise<string> {
    const cacheKey = this.generateCacheKey('followup', { question, answer });
    const cached = await this.cacheService.get<string>(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for follow-up generation: ${cacheKey}`);
      return cached;
    }

    const prompt = this.promptBuilder.buildFollowUpPrompt(question, answer);

    const response = await this.executeWithRetry(async () => {
      return await this.circuitBreaker.execute(async () => {
        return await this.callClaude(prompt, 0.7);
      });
    });

    const followUp = this.responseParser.parseTextResponse(response);

    // Cache for 30 minutes
    await this.cacheService.set(cacheKey, followUp, 1800);

    return followUp;
  }

  /**
   * Analyze a resume for ATS compatibility and quality
   */
  async analyzeResume(dto: AnalyzeResumeDto): Promise<ResumeAnalysisResponseDto> {
    // Don't cache resume analysis as resumes should be unique
    const prompt = this.promptBuilder.buildResumeAnalysisPrompt(
      dto.resumeText,
      dto.jobDescription,
      dto.targetIndustry,
      dto.targetRole,
    );

    const response = await this.executeWithRetry(async () => {
      return await this.circuitBreaker.execute(async () => {
        return await this.callClaude(prompt, 0.5, 8192); // Higher token limit for detailed analysis
      });
    });

    const analysis = this.responseParser.parseResumeAnalysis(response);

    // Track token usage
    await this.tokenCounter.trackUsage('analyze_resume', prompt, response);

    return analysis;
  }

  /**
   * Generate comprehensive feedback for an entire interview
   */
  async generateInterviewFeedback(dto: GenerateFeedbackDto): Promise<InterviewFeedbackResponseDto> {
    const prompt = this.promptBuilder.buildInterviewFeedbackPrompt(
      dto.interviewData,
      dto.overallScore,
      dto.targetRole,
    );

    const response = await this.executeWithRetry(async () => {
      return await this.circuitBreaker.execute(async () => {
        return await this.callClaude(prompt, 0.5, 6144);
      });
    });

    const feedback = this.responseParser.parseInterviewFeedback(response);

    // Track token usage
    await this.tokenCounter.trackUsage('generate_feedback', prompt, response);

    return feedback;
  }

  /**
   * Call Claude API with the given prompt
   */
  private async callClaude(prompt: string, temperature?: number, maxTokens?: number): Promise<string> {
    const startTime = Date.now();

    try {
      this.logger.debug(`Calling Claude API with prompt length: ${prompt.length}`);

      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: maxTokens || this.maxTokens,
        temperature: temperature !== undefined ? temperature : this.temperature,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      this.logger.debug(`Claude API call completed in ${duration}ms`);

      // Extract text from response
      const textContent = message.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      // Log token usage
      this.logger.debug(
        `Token usage - Input: ${message.usage.input_tokens}, Output: ${message.usage.output_tokens}`,
      );

      return textContent.text;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Claude API call failed after ${duration}ms`, error);

      // Don't log the full prompt to avoid exposing sensitive data
      this.logger.error(`Error details: ${error instanceof Error ? error.message : 'Unknown error'}`);

      throw new Error('Failed to communicate with AI service');
    }
  }

  /**
   * Execute a function with exponential backoff retry logic
   */
  private async executeWithRetry<T>(fn: () => Promise<T>, attempt: number = 1): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= this.retryAttempts) {
        this.logger.error(`Max retry attempts (${this.retryAttempts}) reached`);
        throw error;
      }

      const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
      this.logger.warn(`Retry attempt ${attempt}/${this.retryAttempts} after ${delay}ms`);

      await this.sleep(delay);
      return this.executeWithRetry(fn, attempt + 1);
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate cache key for caching responses
   */
  private generateCacheKey(operation: string, data: any): string {
    const dataStr = JSON.stringify(data);
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < dataStr.length; i++) {
      const char = dataStr.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `claude:${operation}:${hash}`;
  }

  /**
   * Health check method
   */
  async healthCheck(): Promise<{ status: string; model: string; circuitBreakerState: string }> {
    const circuitState = this.circuitBreaker.getState();
    return {
      status: circuitState === 'OPEN' ? 'degraded' : 'healthy',
      model: this.model,
      circuitBreakerState: circuitState,
    };
  }
}
