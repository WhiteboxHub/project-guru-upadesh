import { IsString, IsOptional, IsObject, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionCategory } from './generate-question.dto';

export class EvaluateAnswerDto {
  @ApiProperty({
    description: 'The interview question that was asked',
    example: 'Tell me about a time when you had to deal with a difficult team member.',
  })
  @IsString()
  @MinLength(10)
  question: string;

  @ApiProperty({
    description: 'The candidate answer to evaluate',
    example: 'In my previous role, I worked with a team member who consistently...',
  })
  @IsString()
  @MinLength(20)
  answer: string;

  @ApiProperty({
    enum: QuestionCategory,
    description: 'Category of the question for appropriate evaluation criteria',
  })
  @IsEnum(QuestionCategory)
  category: QuestionCategory;

  @ApiPropertyOptional({
    description: 'Additional context about the interview or candidate',
    example: { role: 'Senior Developer', company: 'Google', yearsOfExperience: 5 },
  })
  @IsOptional()
  @IsObject()
  context?: {
    role?: string;
    company?: string;
    yearsOfExperience?: number;
    industry?: string;
  };
}

export class AnswerEvaluationResponseDto {
  @ApiProperty({
    description: 'Overall score from 0-100',
    example: 85,
  })
  score: number;

  @ApiProperty({
    description: 'Grade representation (A+, A, B+, B, C+, C, D, F)',
    example: 'B+',
  })
  grade: string;

  @ApiProperty({
    description: 'Detailed feedback on the answer',
  })
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };

  @ApiProperty({
    description: 'Breakdown of scores by evaluation criteria',
  })
  scoreBreakdown: {
    [key: string]: {
      score: number;
      comment: string;
    };
  };

  @ApiProperty({
    description: 'STAR method evaluation (for behavioral questions)',
    required: false,
  })
  starEvaluation?: {
    situation: { present: boolean; score: number; comment: string };
    task: { present: boolean; score: number; comment: string };
    action: { present: boolean; score: number; comment: string };
    result: { present: boolean; score: number; comment: string };
  };

  @ApiProperty({
    description: 'Suggested improved answer',
  })
  improvedAnswer?: string;
}
