import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ClaudeService } from '../services/claude/claude.service';
import { CacheService } from '../utils/cache.service';
import { TokenCounterService } from '../utils/token-counter.service';
import {
  GenerateQuestionDto,
  GeneratedQuestionResponseDto,
} from '../dto/generate-question.dto';
import {
  EvaluateAnswerDto,
  AnswerEvaluationResponseDto,
} from '../dto/evaluate-answer.dto';
import {
  AnalyzeResumeDto,
  ResumeAnalysisResponseDto,
} from '../dto/analyze-resume.dto';
import {
  GenerateFeedbackDto,
  InterviewFeedbackResponseDto,
} from '../dto/generate-feedback.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(
    private readonly claudeService: ClaudeService,
    private readonly cacheService: CacheService,
    private readonly tokenCounter: TokenCounterService,
  ) {}

  @Post('generate-question')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 50, ttl: 3600000 } })
  @ApiOperation({ summary: 'Generate an interview question' })
  @ApiResponse({
    status: 200,
    description: 'Question generated successfully',
    type: GeneratedQuestionResponseDto,
  })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generateQuestion(
    @Body() dto: GenerateQuestionDto,
  ): Promise<GeneratedQuestionResponseDto> {
    return await this.claudeService.generateInterviewQuestion(dto);
  }

  @Post('evaluate-answer')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 3600000 } })
  @ApiOperation({ summary: 'Evaluate a candidate answer' })
  @ApiResponse({
    status: 200,
    description: 'Answer evaluated successfully',
    type: AnswerEvaluationResponseDto,
  })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async evaluateAnswer(
    @Body() dto: EvaluateAnswerDto,
  ): Promise<AnswerEvaluationResponseDto> {
    return await this.claudeService.evaluateAnswer(dto);
  }

  @Post('generate-followup')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 50, ttl: 3600000 } })
  @ApiOperation({ summary: 'Generate a follow-up question' })
  @ApiResponse({
    status: 200,
    description: 'Follow-up question generated successfully',
  })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generateFollowUp(
    @Body() body: { question: string; answer: string },
  ): Promise<{ followUpQuestion: string }> {
    const followUp = await this.claudeService.generateFollowUp(
      body.question,
      body.answer,
    );
    return { followUpQuestion: followUp };
  }

  @Post('analyze-resume')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 3600000 } })
  @ApiOperation({ summary: 'Analyze a resume for ATS compatibility and quality' })
  @ApiResponse({
    status: 200,
    description: 'Resume analyzed successfully',
    type: ResumeAnalysisResponseDto,
  })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async analyzeResume(
    @Body() dto: AnalyzeResumeDto,
  ): Promise<ResumeAnalysisResponseDto> {
    return await this.claudeService.analyzeResume(dto);
  }

  @Post('generate-feedback')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 3600000 } })
  @ApiOperation({ summary: 'Generate comprehensive interview feedback' })
  @ApiResponse({
    status: 200,
    description: 'Feedback generated successfully',
    type: InterviewFeedbackResponseDto,
  })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generateFeedback(
    @Body() dto: GenerateFeedbackDto,
  ): Promise<InterviewFeedbackResponseDto> {
    return await this.claudeService.generateInterviewFeedback(dto);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    service: string;
    ai: {
      status: string;
      model: string;
      circuitBreakerState: string;
    };
    cache: {
      enabled: boolean;
      connected: boolean;
      keyCount: number;
    };
    tokens: {
      totalOperations: number;
      totalTokens: number;
      estimatedTotalCost: number;
    };
  }> {
    const aiHealth = await this.claudeService.healthCheck();
    const cacheStats = await this.cacheService.getStats();
    const tokenStats = await this.tokenCounter.getStats();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ai-service',
      ai: aiHealth,
      cache: cacheStats,
      tokens: {
        totalOperations: tokenStats.totalOperations,
        totalTokens: tokenStats.totalTokens,
        estimatedTotalCost: tokenStats.estimatedTotalCost,
      },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get service statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(): Promise<{
    tokenUsage: any;
    cacheStats: any;
  }> {
    const tokenStats = await this.tokenCounter.getStats();
    const cacheStats = await this.cacheService.getStats();

    return {
      tokenUsage: tokenStats,
      cacheStats,
    };
  }
}
