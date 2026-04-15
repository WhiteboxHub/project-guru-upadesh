import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzeResumeDto {
  @ApiProperty({
    description: 'Resume text content to analyze',
    example: 'John Doe\nSoftware Engineer\n\nExperience:\n- Company A (2020-2023)...',
  })
  @IsString()
  @MinLength(100)
  @MaxLength(50000)
  resumeText: string;

  @ApiPropertyOptional({
    description: 'Target job description for ATS matching',
  })
  @IsOptional()
  @IsString()
  jobDescription?: string;

  @ApiPropertyOptional({
    description: 'Target industry for industry-specific recommendations',
    example: 'Technology',
  })
  @IsOptional()
  @IsString()
  targetIndustry?: string;

  @ApiPropertyOptional({
    description: 'Target role for role-specific optimization',
    example: 'Senior Software Engineer',
  })
  @IsOptional()
  @IsString()
  targetRole?: string;
}

export class ResumeAnalysisResponseDto {
  @ApiProperty({
    description: 'Overall ATS compatibility score (0-100)',
    example: 78,
  })
  atsScore: number;

  @ApiProperty({
    description: 'Overall quality score (0-100)',
    example: 82,
  })
  overallScore: number;

  @ApiProperty({
    description: 'Analysis summary',
  })
  summary: {
    strengths: string[];
    weaknesses: string[];
    missingElements: string[];
  };

  @ApiProperty({
    description: 'Keyword analysis and optimization',
  })
  keywords: {
    present: string[];
    missing: string[];
    suggestions: string[];
  };

  @ApiProperty({
    description: 'Formatting and structure analysis',
  })
  formatting: {
    score: number;
    issues: string[];
    recommendations: string[];
  };

  @ApiProperty({
    description: 'Content quality analysis',
  })
  content: {
    score: number;
    feedback: string[];
    improvements: string[];
  };

  @ApiProperty({
    description: 'Impact and achievement analysis',
  })
  impact: {
    quantifiedAchievements: number;
    actionVerbUsage: number;
    suggestions: string[];
  };

  @ApiProperty({
    description: 'Job match score if job description provided',
    required: false,
  })
  jobMatch?: {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    recommendations: string[];
  };
}
