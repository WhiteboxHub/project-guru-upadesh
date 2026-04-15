import { Injectable, Logger } from '@nestjs/common';
import { GeneratedQuestionResponseDto } from '@dto/generate-question.dto';
import { AnswerEvaluationResponseDto } from '@dto/evaluate-answer.dto';
import { ResumeAnalysisResponseDto } from '@dto/analyze-resume.dto';
import { InterviewFeedbackResponseDto } from '@dto/generate-feedback.dto';

@Injectable()
export class ResponseParserService {
  private readonly logger = new Logger(ResponseParserService.name);

  /**
   * Parse Claude's response for generated questions
   */
  parseGeneratedQuestion(response: string): Partial<GeneratedQuestionResponseDto> {
    try {
      const cleaned = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleaned);

      return {
        question: parsed.question || '',
        evaluationCriteria: parsed.evaluationCriteria || [],
        suggestedTimeSeconds: parsed.suggestedTimeSeconds || 180,
        hints: parsed.hints || [],
      };
    } catch (error) {
      this.logger.error('Failed to parse generated question response', error);
      throw new Error('Failed to parse AI response for question generation');
    }
  }

  /**
   * Parse Claude's response for answer evaluation
   */
  parseAnswerEvaluation(response: string): AnswerEvaluationResponseDto {
    try {
      const cleaned = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleaned);

      return {
        score: this.validateScore(parsed.score),
        grade: parsed.grade || this.scoreToGrade(parsed.score),
        feedback: {
          strengths: parsed.feedback?.strengths || [],
          weaknesses: parsed.feedback?.weaknesses || [],
          suggestions: parsed.feedback?.suggestions || [],
        },
        scoreBreakdown: parsed.scoreBreakdown || {},
        starEvaluation: parsed.starEvaluation || undefined,
        improvedAnswer: parsed.improvedAnswer || undefined,
      };
    } catch (error) {
      this.logger.error('Failed to parse answer evaluation response', error);
      throw new Error('Failed to parse AI response for answer evaluation');
    }
  }

  /**
   * Parse Claude's response for resume analysis
   */
  parseResumeAnalysis(response: string): ResumeAnalysisResponseDto {
    try {
      const cleaned = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleaned);

      return {
        atsScore: this.validateScore(parsed.atsScore),
        overallScore: this.validateScore(parsed.overallScore),
        summary: {
          strengths: parsed.summary?.strengths || [],
          weaknesses: parsed.summary?.weaknesses || [],
          missingElements: parsed.summary?.missingElements || [],
        },
        keywords: {
          present: parsed.keywords?.present || [],
          missing: parsed.keywords?.missing || [],
          suggestions: parsed.keywords?.suggestions || [],
        },
        formatting: {
          score: this.validateScore(parsed.formatting?.score || 0),
          issues: parsed.formatting?.issues || [],
          recommendations: parsed.formatting?.recommendations || [],
        },
        content: {
          score: this.validateScore(parsed.content?.score || 0),
          feedback: parsed.content?.feedback || [],
          improvements: parsed.content?.improvements || [],
        },
        impact: {
          quantifiedAchievements: parsed.impact?.quantifiedAchievements || 0,
          actionVerbUsage: this.validateScore(parsed.impact?.actionVerbUsage || 0),
          suggestions: parsed.impact?.suggestions || [],
        },
        jobMatch: parsed.jobMatch
          ? {
              score: this.validateScore(parsed.jobMatch.score),
              matchedSkills: parsed.jobMatch.matchedSkills || [],
              missingSkills: parsed.jobMatch.missingSkills || [],
              recommendations: parsed.jobMatch.recommendations || [],
            }
          : undefined,
      };
    } catch (error) {
      this.logger.error('Failed to parse resume analysis response', error);
      throw new Error('Failed to parse AI response for resume analysis');
    }
  }

  /**
   * Parse Claude's response for interview feedback
   */
  parseInterviewFeedback(response: string): InterviewFeedbackResponseDto {
    try {
      const cleaned = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleaned);

      return {
        summary: {
          overallScore: this.validateScore(parsed.summary?.overallScore || 0),
          grade: parsed.summary?.grade || this.scoreToGrade(parsed.summary?.overallScore),
          performance: parsed.summary?.performance || '',
        },
        strengths: parsed.strengths || [],
        areasForImprovement: parsed.areasForImprovement || [],
        recommendations: parsed.recommendations || [],
        categoryBreakdown: (parsed.categoryBreakdown || []).map((item: any) => ({
          category: item.category || '',
          score: this.validateScore(item.score || 0),
          feedback: item.feedback || '',
        })),
        nextSteps: parsed.nextSteps || [],
      };
    } catch (error) {
      this.logger.error('Failed to parse interview feedback response', error);
      throw new Error('Failed to parse AI response for interview feedback');
    }
  }

  /**
   * Parse simple text response (for follow-up questions)
   */
  parseTextResponse(response: string): string {
    return response.trim();
  }

  /**
   * Clean JSON response by removing markdown code blocks and extra whitespace
   */
  private cleanJsonResponse(response: string): string {
    let cleaned = response.trim();

    // Remove markdown code blocks
    cleaned = cleaned.replace(/```json\s*/gi, '');
    cleaned = cleaned.replace(/```\s*/g, '');

    // Find the first { and last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return cleaned;
  }

  /**
   * Validate and normalize score to 0-100 range
   */
  private validateScore(score: number): number {
    const normalized = Math.round(score);
    return Math.max(0, Math.min(100, normalized));
  }

  /**
   * Convert numerical score to letter grade
   */
  private scoreToGrade(score: number): string {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 63) return 'D';
    if (score >= 60) return 'D-';
    return 'F';
  }

  /**
   * Extract JSON from mixed content response
   */
  extractJsonFromResponse(response: string): string {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    return response;
  }
}
