import { IsString, IsArray, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateFeedbackDto {
  @ApiProperty({
    description: 'Array of question-answer pairs from the interview',
  })
  @IsArray()
  interviewData: Array<{
    question: string;
    answer: string;
    category: string;
    score: number;
  }>;

  @ApiPropertyOptional({
    description: 'Overall interview score (0-100)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overallScore?: number;

  @ApiPropertyOptional({
    description: 'Interview duration in minutes',
  })
  @IsOptional()
  @IsNumber()
  interviewDuration?: number;

  @ApiPropertyOptional({
    description: 'Target role for personalized feedback',
  })
  @IsOptional()
  @IsString()
  targetRole?: string;
}

export class InterviewFeedbackResponseDto {
  @ApiProperty({
    description: 'Overall performance summary',
  })
  summary: {
    overallScore: number;
    grade: string;
    performance: string;
  };

  @ApiProperty({
    description: 'Strengths identified during the interview',
  })
  strengths: string[];

  @ApiProperty({
    description: 'Areas needing improvement',
  })
  areasForImprovement: string[];

  @ApiProperty({
    description: 'Specific recommendations for improvement',
  })
  recommendations: string[];

  @ApiProperty({
    description: 'Performance breakdown by category',
  })
  categoryBreakdown: Array<{
    category: string;
    score: number;
    feedback: string;
  }>;

  @ApiProperty({
    description: 'Next steps and action items',
  })
  nextSteps: string[];
}
