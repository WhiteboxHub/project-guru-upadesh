import { IsString, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum QuestionCategory {
  BEHAVIORAL = 'behavioral',
  TECHNICAL = 'technical',
  SYSTEM_DESIGN = 'system_design',
  CODING = 'coding',
  CASE_STUDY = 'case_study',
  SITUATIONAL = 'situational',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export class GenerateQuestionDto {
  @ApiProperty({
    enum: QuestionCategory,
    description: 'Category of the interview question',
    example: QuestionCategory.BEHAVIORAL,
  })
  @IsEnum(QuestionCategory)
  category: QuestionCategory;

  @ApiProperty({
    enum: DifficultyLevel,
    description: 'Difficulty level of the question',
    example: DifficultyLevel.MEDIUM,
  })
  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @ApiPropertyOptional({
    description: 'Target company for tailored questions',
    example: 'Google',
  })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({
    description: 'Job role for context-specific questions',
    example: 'Senior Software Engineer',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: 'Industry for domain-specific questions',
    example: 'Tech',
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({
    description: 'Number of years of experience',
    example: 5,
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsOfExperience?: number;
}

export class GeneratedQuestionResponseDto {
  @ApiProperty({ description: 'Generated interview question' })
  question: string;

  @ApiProperty({ description: 'Question category' })
  category: QuestionCategory;

  @ApiProperty({ description: 'Difficulty level' })
  difficulty: DifficultyLevel;

  @ApiProperty({ description: 'Suggested time to answer (in seconds)' })
  suggestedTimeSeconds: number;

  @ApiProperty({ description: 'Key evaluation criteria for the answer' })
  evaluationCriteria: string[];

  @ApiProperty({ description: 'Sample answer structure or hints' })
  hints?: string[];
}
